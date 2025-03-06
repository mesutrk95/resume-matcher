"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResumeTemplate } from "@prisma/client";
import { revalidatePath } from "next/cache";

const DEFAULT_RESUME_CONTENT = {
    experiences: []
}

export async function deleteResumeTemplate(id: string) {
    try {
        const user = await currentUser()
        await db.resumeTemplate.delete({
            where: { id, userId: user?.id },
        });

        revalidatePath("/templates");
        return { success: true };
    } catch (error) {
        return { success: false, error: { message: "Failed to delete template" } };
    }
}

export async function updateResumeTemplate(template: ResumeTemplate) {
    try {
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

        return {
            success: true,
            data: updatedJob,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: {
                message: "Failed to update template",
            },
        };
    }
}

export async function createResumeTemplate() {
    try {
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

        return {
            success: true,
            data: template,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: {
                message: "Failed to create template",
            },
        };
    }
}