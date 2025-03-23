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
import { getAIHtmlResponse, getAIJsonResponse } from "@/lib/ai";
import { JobAnalyzeResult } from "@/types/job";
import { chunkArray, hashString } from "@/lib/utils";
import { analyzeJobByAI } from "./job";
import {
  migrateResumeContent,
  resumeExperiencesToString,
  resumeSkillsToString,
} from "@/lib/resume-content";

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
  const content = resume.content && migrateResumeContent(resume.content as ResumeContent)

  // Update job in database
  const updatedJob = await db.jobResume.update({
    where: {
      id: resume.id,
      userId: user?.id,
    },
    data: {
      name: resume.name,
      content: content || DEFAULT_RESUME_CONTENT,
      updatedAt: new Date(),
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

  // let content = `Job Description: \n${jobResume?.job.title}\n${jobResume?.job.description}`;

  // content += `\n\nMy Resume Content: \n${convertResumeObjectToString(
  //   jobResume?.content as ResumeContent
  // )}`

  const getExperiencesImprovementNotes = async () => {
    const prompt = `I am building an AI-powered application to generate and optimize resumes. I need the AI to provide detailed suggestions for improving a given resume to ensure it passes Applicant Tracking Systems (ATS) and aligns with a specific job description. The AI should analyze the resume and job description, then provide actionable suggestions in the following format:

[
    {
        "title": "Correct [specific issue or area for improvement]",
        "text": "Source text in resume",
        "improvement": "AI suggestion text, highlight keys using Tailwind CSS classes by [bg|text]-[red|green|orange]-[100-500], font-bold, etc.",
        "action": {
            "id": "var_....",
            "type": "update" | "create",
            "content": "pure and complete suggested new text without formatting"
        }
    },
    ...
]

The AI should:
1. Analyze the provided resume and job description.
2. Identify areas for improvement, such as adding/removing technologies, optimizing content for ATS, and enhancing readability.
3. Provide specific suggestions in the requested format, including Tailwind CSS classes for highlighting.
4. Ensure the suggestions are actionable and directly applicable to the resume.

Here is the resume:
${resumeExperiencesToString(jobResume.content as ResumeContent, true)}
Here is the job description:
${jobResume?.job.title}\n${jobResume?.job.description}

Please provide the best suggestions for improving the resume based on the above requirements.
Ensure the response is in a valid JSON format with no extra text!`;

    return getAIJsonResponse(prompt, []);
  };

  const getSkillsImprovementNotes = async () => {
    const prompt = `
I am building an AI-powered application to optimize resumes. I need the AI to analyze the **skills** section of a given resume and provide the **best skill set** that aligns with a specific job description. The AI should provide actionable suggestion in the following format:

    {
        "title": "Correct Skill Alignment",
        "text": "Source text in resume",
        "improvement": "AI suggestion text, allowed to use Tailwind CSS classes to highlight texts by [bg|text]-[red|green|orange]-[100-500], font-bold, etc.",
        "action": {
            "id": "skills",
            "type": "update",
            "content": "pure and complete suggested new text"
        }
    }

The AI should:
1. Analyze the provided resume's **skills** section.
2. Identify missing or irrelevant skills based on the job description.
3. Provide the **best skill set** that aligns with the job description, including Tailwind CSS classes for highlighting.
4. Ensure the suggestions are actionable and directly applicable to the resume.
 
Here is the resume's **skills** section:
${resumeSkillsToString(jobResume.content as ResumeContent)}

Here is the job description:
${jobResume?.job.title}\n${jobResume?.job.description}

Please provide the best skill set for the resume based on the above requirements.
Ensure the response is in a valid JSON format with no extra text!`;

    return getAIJsonResponse(prompt, []);
  };

  const getScore = async () => {
    const prompt = `I'm trying to score this resume based on job description, the point is it should be able to pass ATS easily, you need to give a score to the resume content based on how well it matches the job description, for missed_keywords dont need to mention not important ones, give me the details in this format { "score" : 45, "matched_keywords": [...] , "missed_keywords": [...] }
    Job Description: \n${jobResume?.job.title}\n${jobResume?.job.description}
    Ensure the response is in a valid JSON format with no extra text!`;

    return getAIJsonResponse(prompt, [pdfBuffer]);
  };

  const results = await Promise.all([
    getScore(),
    getSkillsImprovementNotes(),
    getExperiencesImprovementNotes(),
  ]);

  const newAnalyzeResults = {
    ...((jobResume?.analyzeResults as ResumeAnalyzeResults) || {}),
    ...results[0].result,
    notes: [results[1].result, ...results[2].result],
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

export const askCustomQuestionFromAI = async (
  jobResumeId: string,
  question: string,
  shareJobDescription: boolean,
  formData?: FormData | null
) => {
  let pdfBuffer = null;
  if (formData) {
    const file = formData.get("file") as File;

    const bytes = await file.arrayBuffer();
    pdfBuffer = Buffer.from(bytes);
  }

  const user = await currentUser();

  const jobResume = await db.jobResume.findUnique({
    where: {
      id: jobResumeId,
      userId: user?.id,
    },
    select: {
      job: {
        select: {
          description: true,
          companyName: true,
        },
      },
    },
  });

  if (!jobResume) {
    throw new Error("Job Resume not found");
  }
  const content: (string | Buffer)[] = [question];
  pdfBuffer && content.push(pdfBuffer);
  shareJobDescription &&
    jobResume.job.description &&
    content.push(
      `Company: ${jobResume.job.companyName}\n${jobResume.job.description}`
    );

  return getAIHtmlResponse(
    "Your role is to answer the question based on my resume and JD, give ready to user answers. give me your message in html format and feel free to use font-bold class and <br/> tag for new line. I wanna show the html output in a message bubble.",
    content
  );
};
