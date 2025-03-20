"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobResume } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_CONTENT } from "./constants";
import {
  ResumeAnalyzeResults,
  ResumeContent,
  ResumeItemScoreAnalyze,
} from "@/types/resume";
import { getAIJsonResponse } from "@/lib/ai";
import { JobAnalyzeResult } from "@/types/job";
import { chunkArray, hashString } from "@/lib/utils";
import { analyzeJobByAI } from "./job";

export const findJobResume = async (id: string) => {
  const user = await currentUser();
  const jobResume = await db.jobResume.findUnique({
    where: { id, userId: user?.id },
  });
  return jobResume;
};

export const createJobResume = async (
  jobId: string,
  resumeTemplateId: string
) => {
  const user = await currentUser();
  const resumeTemplate = await db.resumeTemplate.findUnique({
    where: { id: resumeTemplateId, userId: user?.id },
  });
  const job = await db.job.findUnique({
    where: { id: jobId, userId: user?.id },
  });

  if (!resumeTemplate) {
    throw new Error(
      "Resume Template not found or you don't have permission to use it"
    );
  }

  const resumeJob = await db.jobResume.create({
    data: {
      jobId: jobId,
      baseResumeTemplateId: resumeTemplateId,
      content: resumeTemplate?.content || {},
      name: `${job?.title} at ${job?.companyName}`,
      userId: user?.id!,
    },
  });

  revalidatePath("/resumes");

  return resumeJob;
};

export const updateJobResume = async (resume: JobResume) => {
  const user = await currentUser();

  // Update job in database
  const updatedJob = await db.jobResume.update({
    where: {
      id: resume.id,
      userId: user?.id,
    },
    data: {
      name: resume.name,
      content: resume.content || DEFAULT_RESUME_CONTENT,
      updatedAt: new Date()
    },
  });

  revalidatePath("/resumes");
  revalidatePath(`/resumes/${resume.id}`);

  return updatedJob;
};
export const deleteJobResume = async (id: string) => {
  await db.jobResume.delete({
    where: { id },
  });

  revalidatePath("/resumes");
  revalidatePath(`/resumes/${id}`);
  return true;
};

export const analyzeResumeScore = async (
  formData: FormData,
  jobResumeId: string
) => {
  const file = formData.get("file") as File;

  const bytes = await file.arrayBuffer();
  const pdfBuffer = Buffer.from(bytes);

  const user = await currentUser();
  const jobResume = await db.jobResume.findUnique({
    where: { id: jobResumeId, userId: user?.id },
    include: {
      job: true,
    },
  });

  if (!jobResume) throw new Error("Resume not found.");

  let content = `Job Description: \n${jobResume?.job.title}\n${jobResume?.job.description}`;

  // content += `\n\nMy Resume Content: \n${convertResumeObjectToString(
  //   jobResume?.content as ResumeContent
  // )}`

  const getImprovementNotes = async () => {
    const prompt = `I'm trying to score this resume based on job description, the point is it should be able to pass ATS easily, address top 10 notes and imporvments can applied to the resume to make it best to increase the score from ATS viewpoint in html format,
  you are allowed to use tailwind classes to highlight the texts by bg and text color classes like [bg|text]-[red|green|orange]-[100-500], font-bold, ...
  give me the details in this format:
  [
    { "title": "correct bla bla ...", text: "..." , "improvement": "..."},
     ...
  ]

  text and improvement should be html formatted text, Ensure the response is in a valid JSON format with no extra text!
  `;

    return getAIJsonResponse(prompt, [pdfBuffer, content]);
  };
  const getScore = async () => {
    const prompt = `I'm trying to score this resume based on job description, the point is it should be able to pass ATS easily, you need to give a score to the resume content based on how well it matches the job description, for missed_keywords dont need to mention not important ones, give me the details in this format { "score" : 45, "matched_keywords": [...] , "missed_keywords": [...] }, , Ensure the response is in a valid JSON format with no extra text!`;

    return getAIJsonResponse(prompt, [pdfBuffer, content]);
  };

  const results = await Promise.all([getScore(), getImprovementNotes()]);

  const newAnalyzeResults = {
    ...((jobResume?.analyzeResults as ResumeAnalyzeResults) || {}),
    ...results[0].result,
    notes: results[1].result,
  } as ResumeAnalyzeResults;

  await db.jobResume.update({
    where: { id: jobResumeId },
    data: {
      analyzeResults: newAnalyzeResults,
    },
  });

  return newAnalyzeResults;
};

const analyzeResumeExperiencesScores = async (
  analyzeResults: JobAnalyzeResult,
  content: string
) => {
  const prompt = `I'm trying to find the best matches of my experiences based on the job description to ensure they pass ATS easily. For each variation or project item, you need to:
  
1. Assign a score (on a scale from 0 to 1) based on how many relevant keywords from the job description are present in the item. The score does not require a full match with all JD keywords, but rather reflects the relevance of the item to the JD.
  2. Provide a list of exact words or phrases (matched_keywords) that appear in both the item and the job description. Only include words or phrases that are an exact match.
  
  Return the results in the following format:
  [{ "id": "variation_id", "score": 0.55, "matched_keywords": ["exact_word1", "exact_word2", ...] }, ...] 
  `;

  const generatedContent = await getAIJsonResponse(prompt, [
    `## Job description summary: ${analyzeResults.summary}\n ## My Resume Items\n` +
      content +
      "\n Ensure the response is in a valid JSON format with no extra text! Make sure all the variations have score.",
  ]);

  return generatedContent;
};

const analyzeResumeProjectsScores = async (
  analyzeResults: JobAnalyzeResult,
  content: string
) => {
  const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, you need to give a score (on a scale from 0 to 1) to each project item based on how well it matches the job description, give me the best matches in this format [{ "id" : "project_..", "score": 0.55, "matched_keywords": [...] },...], Ensure the response is in a valid JSON format with no extra text!`;

  const generatedContent = await getAIJsonResponse(prompt, [
    content +
      "\n" +
      `Job description summary: ${analyzeResults.summary} \n Make sure all the variations have score.`,
  ]);

  return generatedContent;
};

export const analyzeResumeItemsScores = async (
  jobResumeId: string,
  forceCheckAll?: boolean
) => {
  const user = await currentUser();

  const jobResume = await db.jobResume.findUnique({
    where: {
      id: jobResumeId,
      userId: user?.id,
    },
    include: {
      job: true,
    },
  });

  if (!jobResume) {
    throw new Error("Job Resume not found");
  }

  const resumeAnalyzeResults = jobResume.analyzeResults as ResumeAnalyzeResults;
  const oldItemsScore = resumeAnalyzeResults.itemsScore;

  const resume = jobResume?.content as ResumeContent;
  let variations = resume.experiences
    .map((experience) => experience.items.map((i) => i.variations).flat())
    .flat()
    .map((v) => ({ ...v, hash: hashString(v.content, 8) }));

  // concat with project items
  variations = [
    ...variations,
    ...resume.projects.map((p) => ({
      enabled: p.enabled,
      id: p.id,
      content: p.content,
      hash: hashString(p.content, 8),
    })),
  ];

  variations = forceCheckAll
    ? variations
    : variations.filter((v) => oldItemsScore?.[v.id]?.hash !== v.hash);

  if (variations.length === 0) return resumeAnalyzeResults;

  let jobAnalyzeResults = jobResume.job.analyzeResults as JobAnalyzeResult;
  if (!jobAnalyzeResults?.summary) {
    jobAnalyzeResults = (await analyzeJobByAI(jobResume.jobId)).analyzeResults!;
  }

  // const content = variations.map((v) => `${v.id} - ${v.content}`).join("\n");

  const chunks = chunkArray(variations, 10);
  console.log(chunks, chunks.length);

  const results = await Promise.all(
    chunks.map((items) =>
      analyzeResumeExperiencesScores(
        jobAnalyzeResults,
        items.map((v) => `${v.id} - ${v.content}`).join("\n")
      )
    )
  );
  const scores = results
    .map((res) => res.result as ResumeItemScoreAnalyze[])
    .flat();

  // const resp = await analyzeResumeExperiencesScores(
  //   jobAnalyzeResults,
  //   variations.map((v) => `${v.id} - ${v.content}`).join("\n")
  // );

  // const scores = allItems ;
  const scoresMap = scores.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: {
        ...curr,
        hash: hashString(
          variations.find((v) => curr.id === v.id)?.content || "",
          8
        ),
      },
    }),
    {}
  );

  const newAnalyzeResults = {
    ...resumeAnalyzeResults,
    itemsScore: {
      ...resumeAnalyzeResults.itemsScore,
      ...scoresMap,
    },
  } as ResumeAnalyzeResults;

  await db.jobResume.update({
    where: { id: jobResumeId },
    data: {
      analyzeResults: newAnalyzeResults,
    },
  });

  return newAnalyzeResults;
};

export const suggestProfessionalSummery = async (jobResumeId: string) => {
  const user = await currentUser();

  const jobResume = await db.jobResume.findUnique({
    where: {
      id: jobResumeId,
      userId: user?.id,
    },
    include: {
      job: true,
    },
  });

  if (!jobResume) {
    throw new Error("Job Resume not found");
  }
};
