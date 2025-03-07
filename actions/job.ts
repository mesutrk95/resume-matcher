"use server";

import { db } from "@/lib/db";
import { jobSchema } from "@/schemas";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Job } from "@prisma/client";
import { getAIHtmlResponse, getAIJsonResponse, } from "@/lib/ai";
import { JobAnalyzeResult } from "@/types/job";
import { withErrorHandling } from "./with-error-handling";

import cheerio from 'cheerio';
import axios from "axios";

export const createJob = withErrorHandling(async (values: z.infer<typeof jobSchema>): Promise<Job> => {
    const user = await currentUser();
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

    return job
})

export const updateJob = withErrorHandling(async (values: z.infer<typeof jobSchema> & { id: string }): Promise<Job> => {

    const user = await currentUser();

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

    return updatedJob
});

export const deleteJob = withErrorHandling(async (id: string): Promise<boolean> => {
    const user = await currentUser();
    const job = await db.job.findUnique({
        where: {
            id,
            userId: user?.id,
        },
    });

    if (!job) {
        throw new Error("Job not found or you don't have permission to delete it")
    }

    // Delete the job
    await db.job.delete({
        where: {
            id,
        },
    });

    revalidatePath("/jobs");

    return true;
});

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
        throw new Error("Job not found");
    }

    const results = await Promise.all([analyzeJobKeywords(job), analyzeJobSummary(job)])

    if (results.some(r => r.error)) {
        throw new Error("Failed to analyze job");

    }
    const keywords = results[0].result
    const summary = results[1].result
    const analyzeResults = {
        keywords,
        summary,
    } as JobAnalyzeResult
    await db.job.update({
        where: { id: jobId }, data: {
            analyzeResults
        }
    })

    return analyzeResults;
}

export const analyzeJobScores = async (jobResumeId: string, content: string) => {

    const user = await currentUser();
    const jobResume = await db.jobResume.findUnique({
        where: {
            id: jobResumeId,
            userId: user?.id,
        },
        include: {
            job: true
        }
    });

    if (!jobResume) {
        throw new Error("Job Resume not found");
    }

    let analyzeResults = jobResume.job.analyzeResults as JobAnalyzeResult;
    if (!analyzeResults) {
        analyzeResults = (await analyzeJobByAI(jobResume.jobId))!
    }

    const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, an experience has items, and each item has variations, you need to give a score (on a scale from 0 to 1) to each variation based on how well it matches the job description, in an experience item only one variation can be selected, give me the best matches in this format [{ "id" : "variation_id", "score": 0.55, "matched_keywords": [...] },...], Ensure the response is in a valid JSON format with no extra text!`

    const keywords = analyzeResults.keywords.map(k => `${k.keyword} (${k.level})`).join(',')

    const generatedContent = await getAIJsonResponse(prompt, [content + '\n' + `keywords: ${keywords} \n Make sure all the variations have score.`])

    return generatedContent
}

export const extractJobDescriptionFromUrl = async (url: string) => {
    // Fetch the content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    const cardTop = $('.top-card-layout__entity-info-container').text().trim();
    const description = $('.description__text--rich .show-more-less-html__markup').html()?.trim();


    const jd = `Banner: ${cardTop}, Description: ${description}`.replaceAll('\n', '')
    const prompt = `Extract the following details from the given text, with this keys "description", "companyName", "location" , "title", "postedDate".keep the description in html format and make sure postedDate is in correct date format. Ensure the response is in a valid JSON format with no extra text:\n ${jd}`;

    const result = await getAIJsonResponse(prompt)
    return result
}
