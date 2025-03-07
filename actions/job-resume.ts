"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "./with-error-handling";

export const createJobResume = withErrorHandling(async (jobId: string, resumeTemplateId: string,) => {

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
})

export const deleteJobResume = withErrorHandling(async (id: string) => {

    await db.jobResume.delete({
        where: { id },
    });

    revalidatePath("/jobs/[id]", "page");
    return true
})