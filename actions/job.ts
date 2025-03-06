"use server";

import { db } from "@/lib/db";
import { jobSchema } from "@/schemas";
import { z } from "zod";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type JobActionResponse = {
    success: boolean;
    error?: {
        message: string;
    };
    data?: any;
};

export const createJob = async (values: z.infer<typeof jobSchema>): Promise<JobActionResponse> => {
    try {
        const session = await auth();
        const user = await currentUser();

        // Verify the user is authenticated and the userId matches the session
        if (!session || session.user.id !== user?.id) {
            return {
                success: false,
                error: {
                    message: "Unauthorized",
                },
            };
        }

        // Create job in database
        const job = await db.job.create({
            data: {
                title: values.title,
                companyName: values.companyName,
                description: values.description,
                url: values.url,
                postedAt: values.postedAt,
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
        const session = await auth();

        if (!session) {
            return {
                success: false,
                error: {
                    message: "Unauthorized",
                },
            };
        }

        // Verify the job belongs to the current user
        const job = await db.job.findUnique({
            where: {
                id: values.id,
            },
        });

        if (!job || job.userId !== session.user.id) {
            return {
                success: false,
                error: {
                    message: "Job not found or you don't have permission to edit it",
                },
            };
        }

        // Update job in database
        const updatedJob = await db.job.update({
            where: {
                id: values.id,
            },
            data: {
                title: values.title,
                companyName: values.companyName,
                description: values.description,
                url: values.url,
                postedAt: values.postedAt,
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
        const session = await auth();

        if (!session) {
            return {
                success: false,
                error: {
                    message: "Unauthorized",
                },
            };
        }

        // Verify the job belongs to the current user
        const job = await db.job.findUnique({
            where: {
                id,
            },
        });

        if (!job || job.userId !== session.user.id) {
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