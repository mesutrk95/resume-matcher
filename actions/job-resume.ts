"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobResume } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_CONTENT } from "./constants";

export const createJobResume = async (jobId: string, resumeTemplateId: string,) => {

    const user = await currentUser()
    const resumeTemplate = await db.resumeTemplate.findUnique({ where: { id: resumeTemplateId, userId: user?.id } })
    const job = await db.job.findUnique({ where: { id: jobId, userId: user?.id } })

    if (!resumeTemplate) {
        throw new Error("Resume Template not found or you don't have permission to use it")
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

    return resumeJob
}

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

    return updatedJob
}
export const deleteJobResume = async (id: string) => {

    await db.jobResume.delete({
        where: { id },
    });

    revalidatePath("/jobs/[id]", "page");
    return true
} 