"use server";

import { db } from "@/lib/db";
import { jobSchema } from "@/schemas";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Job } from "@prisma/client";
import { getAIHtmlResponse, getAIJsonResponse, } from "@/lib/ai";

export type JobActionResponse = {
    success: boolean;
    error?: {
        message: string;
    };
    data?: any;
};

export const createJob = async (values: z.infer<typeof jobSchema>): Promise<JobActionResponse> => {
    try {
        const user = await currentUser();

        // Create job in database
        const job = await db.job.create({
            data: {
                title: values.title,
                companyName: values.companyName,
                description: values.description,
                location: values.location,
                url: values.url,
                postedAt: values.postedAt && new Date(values.postedAt),
                createdAt: new Date(),
                userId: user?.id!,
            },
        });

        return {
            success: true,
            data: job,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: {
                message: "Failed to create job",
            },
        };
    }
};

export const updateJob = async (values: z.infer<typeof jobSchema> & { id: string }): Promise<JobActionResponse> => {
    try {
        const user = await currentUser();

        // Update job in database
        const updatedJob = await db.job.update({
            where: {
                id: values.id,
                userId: user?.id,
            },
            data: {
                title: values.title,
                companyName: values.companyName,
                location: values.location,
                description: values.description,
                url: values.url,
                postedAt: values.postedAt && new Date(values.postedAt),
            },
        });

        revalidatePath("/jobs");
        revalidatePath(`/jobs/${values.id}`);

        return {
            success: true,
            data: updatedJob,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: {
                message: "Failed to update job",
            },
        };
    }
};

export const deleteJob = async (id: string): Promise<JobActionResponse> => {
    try {
        const user = await currentUser();


        // Verify the job belongs to the current user
        const job = await db.job.findUnique({
            where: {
                id,
                userId: user?.id,
            },
        });

        if (!job) {
            return {
                success: false,
                error: {
                    message: "Job not found or you don't have permission to delete it",
                },
            };
        }

        // Delete the job
        await db.job.delete({
            where: {
                id,
            },
        });

        revalidatePath("/jobs");

        return {
            success: true,
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: {
                message: "Failed to delete job",
            },
        };
    }
};

const analyzeJobKeywords = async (job: Job) => {
    const prompt = `Analyze the following job description and extract important keywords. 
Categorize each keyword as either "hard", "soft", or "none" based on whether it represents a hard skill, soft skill, or neither (e.g., industry terms like "SaaS"). 
Additionally, assign a level of importance to each keyword on a scale from 0 to 1, where 1 is highly important and 0 is minimally important. 
Provide the results in a structured JSON format as an array of objects, where each object contains the fields "keyword", "skill", and "level". 
Ensure the response is in a valid JSON format with no extra text, without any additional formatting or explanations. catch whatever is important for ATSs, Here is the job:`
    return getAIJsonResponse(prompt, [job.description || ''])
}


const analyzeJobSummary = async (job: Job) => {
    const prompt = `Analyze the following job description concise it, keep all important keywords as it is, you can use bullets for items and <b> <br /> tag, Ensure the response is in a valid HTML format with no extra text:`
    return getAIHtmlResponse(prompt, [job.description || ''])
}

export const analyzeJobByAI = async (jobId: string) => {

    const user = await currentUser();

    const job = await db.job.findUnique({
        where: {
            id: jobId,
            userId: user?.id,
        },
    });

    if (!job) {
        return {
            success: false,
            data: {
                analysis: "Job not found",
            },
        };

    }

    const results = await Promise.all([analyzeJobKeywords(job), analyzeJobSummary(job)])

    if (results.some(r => r.error)) {
        return {
            success: false,
            data: {
                analysis: "Failed to analyze job.",
            },
        };

    }
    const keywords = results[0].result
    const summary = results[1].result
    const analyzeResults = {
        keywords,
        summary,
    }
    await db.job.update({
        where: { id: jobId }, data: {
            analyzeResults
        }
    })

    return {
        success: true,
        data: analyzeResults,
    };
};