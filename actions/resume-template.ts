"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResumeTemplate } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_CONTENT } from "./constants";
import { ResumeContent } from "@/types/resume";

export const deleteResumeTemplate = async (id: string) => {
    const user = await currentUser()
    await db.resumeTemplate.delete({
        where: { id, userId: user?.id },
    });
    revalidatePath("/templates");
    return true
}

export const updateResumeTemplate = async (template: ResumeTemplate) => {
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

    return updatedJob
}

export const updateResumeTemplateContent = async (templateId: string, resmueContent: ResumeContent) => {
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

    return updatedJob
}

export const createResumeTemplate = async () => {
    const user = await currentUser();

    // Update job in database
    const template = await db.resumeTemplate.create({
        data: {
            name: 'No name template',
            description: 'No description',
            content: DEFAULT_RESUME_CONTENT,
            userId: user?.id!,
        },
    });

    revalidatePath("/templates");

    return template
}

export const getResumeTemplate = async (id: string) => {
    const user = await currentUser();

    // Update job in database
    const rt = await db.resumeTemplate.findUnique({
        where: {
            id,
            userId: user?.id!
        },
    });

    return rt
} 