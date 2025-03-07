"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResumeTemplate } from "@prisma/client";
import { revalidatePath } from "next/cache";

const DEFAULT_RESUME_CONTENT = {
    experiences: []
}

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