"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobResume } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_CONTENT } from "./constants";
import { convertResumeObjectToString } from "@/utils/job-matching";
import { ResumeContent } from "@/types/resume";
import { getAIJsonResponse } from "@/lib/ai";

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

export const analyzeResumeScore = async (jobResumeId: string) => {
  const user = await currentUser();
  const jobResume = await db.jobResume.findUnique({
    where: { id: jobResumeId, userId: user?.id },
    include: {
      job: true,
    },
  });
  const content = `Job Description: \n${jobResume?.job.title}\n${
    jobResume?.job.description
  }\n\nMy Resume Content: \n${convertResumeObjectToString(
    jobResume?.content as ResumeContent
  )}`;

  const getImprovementNotes = async (content: string) => {
    const prompt = `I'm trying to score this resume based on job description, the point is it should be able to pass ATS easily, address top 10 notes and imporvments can applied to the resume to make it best to increase the score from ATS viewpoint in html format,
  you are allowed to use tailwind classes to highlight the texts by bg and text color classes like [bg|text]-[red|green|orange]-[100-500], font-bold, ...
  give me the details in this format:
  [
    { "title": "correct bla bla ...", text: "..." , "improvement": "..."},
     ...
  ]

  text and improvement should be html formatted text, Ensure the response is in a valid JSON format with no extra text!
  `;

    return getAIJsonResponse(prompt, [content]);
  };
  const getScore = async (content: string) => {
    const prompt = `I'm trying to score this resume based on job description, the point is it should be able to pass ATS easily, you need to give a score to the resume content based on how well it matches the job description, for missed_keywords dont need to mention not important ones, for notes try to mention the best imporvment points with example to increase the score from ATS viewpoint in html format, give me the details in this format { "score" : 45, "matched_keywords": [...] , "missed_keywords": [...] }, , Ensure the response is in a valid JSON format with no extra text!`;

    return getAIJsonResponse(prompt, [content]);
  };

  const results = await Promise.all([
    getScore(content),
    getImprovementNotes(content),
  ]);
  const result = { ...results[0].result, notes: results[1].result };
  return {
    result,
    prompts: results.map((r) => r.prompt),
    contents: results.map((r) => r.content),
  };
};
