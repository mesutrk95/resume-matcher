'use server';

import { db } from '@/lib/db';
import { jobSchema } from '@/schemas';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Job, JobStatus, Prisma } from '@prisma/client';
import { AIRequestModel, getAIServiceManager } from '@/lib/ai';
import { JobAnalyzeResult } from '@/types/job';
import { downloadImageAsBase64 } from '@/lib/utils';
import { PaginationParams } from '@/types/pagination-params';
import { withErrorHandling } from '@/lib/with-error-handling';
import { load as cheerioLoad } from 'cheerio';
import axios from 'axios';
import moment from 'moment';
import { ForbiddenException } from '@/lib/exceptions';
import { Reasons } from '@/domains/reasons';
import {
  JobAnalysis,
  JobAnalysisSchema,
  JobDescription,
  JobDescriptionSchema,
} from '@/schemas/job';

export const createJob = withErrorHandling(
  async (values: z.infer<typeof jobSchema>): Promise<Job> => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }
    const job = await db.job.create({
      data: {
        title: values.title,
        companyName: values.companyName,
        description: values.description,
        location: values.location,
        url: values.url,
        postedAt: values.postedAt && new Date(values.postedAt),
        createdAt: new Date(),
        userId: user.id,
      },
    });

    revalidatePath('/jobs');
    return job;
  },
);

export const getJobs = withErrorHandling(
  async (
    params: PaginationParams & {
      statuses?: JobStatus[] | undefined;
      search?: string;
    },
  ) => {
    const user = await currentUser();
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const search = params.search || '';
    // const statuses = params.status ? params.status.split(",") : undefined;
    const skip = (page - 1) * pageSize;

    // Prepare search filter
    const searchFilter = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              companyName: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    // Prepare status filter
    const statusFilter =
      params.statuses && params.statuses.length > 0 ? { status: { in: params.statuses } } : {};

    // Get jobs with filters, pagination and sorting
    const jobs = await db.job.findMany({
      where: {
        userId: user.id,
        ...searchFilter,
        ...statusFilter,
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        createdAt: true,
        postedAt: true,
        status: true,
        url: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    // Get total count for pagination
    const totalJobs = await db.job.count({
      where: {
        userId: user.id,
        ...searchFilter,
        ...statusFilter,
      },
    });

    return {
      total: totalJobs,
      jobs,
      page,
      pageSize,
    };
  },
);

export const updateJob = withErrorHandling(
  async (values: z.infer<typeof jobSchema> & { id: string }): Promise<Job> => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new ForbiddenException('Email not verified.');
    }

    const updatedJob = await db.job.update({
      where: {
        id: values.id,
        userId: user.id,
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

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${values.id}`);

    return updatedJob;
  },
);

export const updateJobStatus = withErrorHandling(async (jobId: string, newStatus: JobStatus) => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }

  await db.job.update({
    where: {
      id: jobId,
      userId: user.id,
    },
    data: {
      status: newStatus,
    },
  });

  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);

  return true;
});

export const deleteJob = withErrorHandling(async (id: string): Promise<boolean> => {
  const user = await currentUser();
  if (!user?.emailVerified) {
    throw new ForbiddenException('Email not verified.');
  }
  const job = await db.job.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!job) {
    throw new Error("Job not found or you don't have permission to delete it");
  }

  // Delete the job
  await db.job.delete({
    where: {
      id,
    },
  });

  revalidatePath('/jobs');

  return true;
});

const analyzeJobKeywords = async (job: Job) => {
  const prompt = `Analyze the following job description and extract important keywords. 
Categorize each keyword as either "hard", "soft", or "none" based on whether it represents a hard skill, soft skill, or neither (e.g., industry terms like "SaaS"). 
Additionally, assign a level of importance to each keyword on a scale from 0 to 1, where 1 is highly important and 0 is minimally important. 
Provide the results in a structured JSON format as an array of objects, where each object contains the fields "keyword", "skill", and "level". 
Ensure the response is in a valid JSON format with no extra text, without any additional formatting or explanations. catch whatever is important for ATSs, Here is the job: `;

  // Create a request with zodSchema
  const request: AIRequestModel<JobAnalysis> = {
    prompt,
    responseFormat: 'json',
    zodSchema: JobAnalysisSchema,
    context: {
      reason: Reasons.ANALYZE_JOB_KEYWORDS,
    },
    contents: [
      {
        type: 'text',
        data: job.description || '',
      },
      {
        type: 'text',
        data: job.title || '',
      },
    ],
  };
  const service = getAIServiceManager();
  return await service.executeRequest<JobAnalysis>(request);
};

const analyzeJobSummary = async (job: Job) => {
  const service = getAIServiceManager();
  const requestModel: AIRequestModel<string> = {
    prompt:
      'Analyze the following job description concise it, keep all important keywords as it is, you can use bullets for items and <b> <br /> tags, Ensure the response is in a valid HTML format with no extra text:',
    responseFormat: 'html',
    contents: [
      {
        type: 'text',
        data: job.description || '',
      },
    ],
    context: {
      reason: Reasons.JOB_SUMMARY,
    },
  };
  return await service.executeRequest<string>(requestModel);
};

export const analyzeJobByAI = withErrorHandling(async (jobId: string) => {
  const user = await currentUser();

  const job = await db.job.findUnique({
    where: {
      id: jobId,
      userId: user.id,
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  // await db.job.update({
  //   where: {
  //     id: jobId,
  //   },
  //   data: {
  //     analyzeResults: {
  //       ...(job.analyzeResults || {}) as JobAnalyzeResult,
  //       status: 'pending'
  //     },
  //   },
  // });
  try {
    const results = await Promise.all([analyzeJobKeywords(job), analyzeJobSummary(job)]);

    const keywords = results[0];
    const summary = results[1];
    const analyzeResults = {
      keywords,
      summary,
    } as JobAnalyzeResult;
    await db.job.update({
      where: { id: jobId },
      data: {
        analyzeResults,
      },
    });

    revalidatePath(`/jobs/${jobId}`);

    return { status: 'done', analyzeResults };
  } catch (ex) {
    return { status: 'error', error: ex };
  }
});

export const extractJobDescriptionFromUrl = withErrorHandling(async (url: string) => {
  // Fetch the content of the URL
  const response = await axios.get(url);
  const html = response.data;

  // Load the HTML into cheerio
  const $ = cheerioLoad(html);
  const logoImage = $("img[data-delayed-url*='company-logo']").first().attr('data-delayed-url');

  const cardTop = $('.top-card-layout__entity-info-container').text().trim();
  const description = $('.description__text--rich .show-more-less-html__markup').html()?.trim();

  const jd = `Banner: ${cardTop}, Description: ${description}`.replaceAll('\n', '');

  const prompt = `Extract the following details from the given text, the description in html format and make sure postedDate is in correct date format (YYYY/MM/DD HH:mm) (now: ${moment().format('YYYY/MM/DD HH:mm')})\n`;

  // Create a request with zodSchema
  const request: AIRequestModel<JobDescription> = {
    prompt,
    responseFormat: 'json',
    zodSchema: JobDescriptionSchema,
    context: {
      reason: Reasons.EXTRACT_JOB_DESCRIPTION,
    },
    contents: [
      {
        type: 'text',
        data: jd,
      },
    ],
  };

  let image = null;
  try {
    if (logoImage) image = await downloadImageAsBase64(logoImage);
  } catch (ex) {}

  const aiResult = await getAIServiceManager().executeRequest(request);
  return { ...aiResult, image };
});
