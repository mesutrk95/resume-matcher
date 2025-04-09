"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResumeTemplate } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_CONTENT } from "./constants";
import { ResumeContent } from "@/types/resume";
import { withErrorHandling } from "@/lib/with-error-handling";
import { getAIJsonResponse } from "@/lib/ai";
import { resumeContentSchema } from "@/schemas/resume";
import { zodSchemaToString } from "@/lib/zod";

export const deleteResumeTemplate = async (id: string) => {
  const user = await currentUser();
  await db.resumeTemplate.delete({
    where: { id, userId: user?.id },
  });
  revalidatePath("/templates");
  return true;
};

export const updateResumeTemplate = withErrorHandling(
  async (template: ResumeTemplate) => {
    const user = await currentUser();

    // Update job in database
    const updatedJob = await db.resumeTemplate.update({
      where: {
        id: template.id,
        userId: user?.id,
      },
      data: {
        name: template.name,
        description: template.description,
        content: template.content || DEFAULT_RESUME_CONTENT,
      },
    });

    revalidatePath("/templates");
    revalidatePath(`/templates/${template.id}`);

    return updatedJob;
  }
);

export const updateResumeTemplateContent = async (
  templateId: string,
  resmueContent: ResumeContent
) => {
  const user = await currentUser();

  const updatedJob = await db.resumeTemplate.update({
    where: {
      id: templateId,
      userId: user?.id,
    },
    data: {
      content: resmueContent || DEFAULT_RESUME_CONTENT,
    },
  });

  revalidatePath("/templates");
  revalidatePath(`/templates/${templateId}`);

  return updatedJob;
};

export const createResumeTemplate = async (
  resumeContent?: ResumeContent,
  name?: string,
  description?: string
) => {
  const user = await currentUser();

  // Update job in database
  const template = await db.resumeTemplate.create({
    data: {
      name: name || "No name template",
      description: description,
      content: resumeContent || DEFAULT_RESUME_CONTENT,
      userId: user?.id!,
    },
  });

  revalidatePath("/templates");

  return template;
};

export const createResumeTemplateFromResumePdf = withErrorHandling(
  async (formData: FormData) => {
    const user = await currentUser();
    const file = formData.get("file") as File;

    // throw new NotFoundException();
    const bytes = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(bytes);
    const systemInstructions = `Your task is importing user resume data from the provided pdf resume file and convert it to the following schema format: \n ${zodSchemaToString(
      resumeContentSchema
    )} \n 
  this was schema, you have to give me a valid object out of it, 
  - All dates must be in this format: MM/YYYY
  - ids convention is based on the path they have prefix then an underscore like the following:
    Generate IDs with format prefix_xxxxx. Path determines prefix: experiences=exp_, experiences.items=expitem_, experiences.items.variations=var_, titles=title_, summaries=summary_, educations=edu_, skills/skills.skills=skill_, projects=project_, awards=award_, certifications=cert_, languages=lang_, interests=interest_, references=ref_. The xxxxx is a random 5-character alphabetic string. Example: skill_abcde for a skill.
  - For each experience item in resume file, add one experience item with a variation item and fill its content by resume file experience item
  
  make sure your output is complete in json format without any extra character!`;
    const prompt = "";
    const { result } = await getAIJsonResponse(
      prompt,
      [pdfBuffer],
      systemInstructions
    );

    const content = result as ResumeContent;

    // Update job in database
    const template = await db.resumeTemplate.create({
      data: {
        name: content.titles?.[0]?.content || "No name template",
        content: content,
        userId: user?.id!,
      },
    });

    // revalidatePath("/templates");

    return template;
  }
);

export const getResumeTemplate = async (id: string) => {
  const user = await currentUser();

  // Update job in database
  const rt = await db.resumeTemplate.findUnique({
    where: {
      id,
      userId: user?.id!,
    },
  });

  return rt;
};
