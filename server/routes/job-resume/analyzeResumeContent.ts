import { analyzeJobByAI } from '@/actions/job';
import { Reasons } from '@/domains/reasons';
import { AIRequestModel, ContentItem, getAIServiceManager } from '@/lib/ai';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { chunkArray, hashString, wait } from '@/lib/utils';
import {
  ProjectMatchingResult,
  ProjectMatchingResultSchema,
  ProjectVariationScores,
  ProjectVariationScoresSchema,
} from '@/schemas/resume';
import { protectedProcedure } from '@/server/trpc';
import { updateJobResumeStatusFlags } from '@/services/job-resume';
import { JobAnalyzeResult } from '@/types/job';
import { JobResumeStatusFlags } from '@/types/job-resume';
import { ResumeAnalyzeResults, ResumeContent, ResumeItemScoreAnalyze } from '@/types/resume';
import { JobResume } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const analyzeResumeItemScoreAndKeywords = async (
  analyzeResults: JobAnalyzeResult,
  content: string,
) => {
  const systemInstructions = `I'm trying to find the best matches of my experiences based on the job description to ensure they pass ATS easily. For each variation, project item or summary, you need to:
  
  1. Assign a score (on a scale from 0 to 1) that it reflects the relevance of the item to the JD.
  2. Provide a list of exact words or phrases (matched_keywords) that appear in both the item and the job description. Only include words or phrases that are an exact match.
  
  Return the results in the following format:
  [{ "id": "variation_id", "score": 0.55, "matched_keywords": ["exact_word1", "exact_word2", ...] }, ...]`;

  const prompt =
    `## Job description summary: ${analyzeResults.summary}\n ## My Resume Items\n` +
    content +
    '\n Ensure the response is in a valid JSON format with no extra text! Make sure all the variations have score.';

  const request: AIRequestModel<ProjectVariationScores> = {
    prompt: prompt,
    responseFormat: 'json',
    zodSchema: ProjectVariationScoresSchema,
    context: {
      reason: Reasons.SCORE_RESUME_EXPERIENCES,
    },
    contents: [
      {
        data: systemInstructions,
        type: 'text',
      },
    ],
  };

  try {
    const result = await getAIServiceManager().executeRequest(request);
    return {
      result,
      prompt,
    };
  } catch (error) {
    return {
      error,
      prompt,
    };
  }
};

const analyzeResumeProjectsScores = async (analyzeResults: JobAnalyzeResult, content: string) => {
  const prompt = `I'm trying to find best matches of my experiences based on the job description that can pass ATS easily, you need to give a score (on a scale from 0 to 1) to each project item based on how well it matches the job description, give me the best matches in this format [{ "id" : "project_..", "score": 0.55, "matched_keywords": [...] },...], Ensure the response is in a valid JSON format with no extra text!`;
  const contents: ContentItem[] = [
    {
      type: 'text',
      data: `Job description summary: ${analyzeResults.summary} \n Make sure all the variations have score.`,
    },
  ];
  // Create a request with zodSchema
  const request: AIRequestModel<ProjectMatchingResult> = {
    prompt,
    responseFormat: 'json',
    zodSchema: ProjectMatchingResultSchema,
    context: {
      reason: Reasons.SCORE_RESUME_PROJECTS,
    },
    contents,
  };
  const service = getAIServiceManager();

  try {
    const result = await service.executeRequest(request);
    return {
      result,
      prompt,
      contents,
    };
  } catch (error) {
    return {
      error,
      prompt,
      contents,
    };
  }
};

async function updateJobResumeStatusAndStreamEvent(
  jobResume: JobResume,
  statusFlags: Partial<JobResumeStatusFlags>,
  analyzeResults?: ResumeAnalyzeResults,
) {
  const result = await updateJobResumeStatusFlags(jobResume, statusFlags);
  return {
    statusFlags: result,
    ...(analyzeResults && { analyzeResults }),
  };
}

function getAllResumeItems(jobResume: JobResume, outdated?: boolean) {
  const resumeAnalyzeResults = jobResume.analyzeResults as ResumeAnalyzeResults;
  const oldItemsScore = resumeAnalyzeResults.itemsScore;

  const resume = jobResume?.content as ResumeContent;
  let variations = resume.experiences
    .map(experience => experience.items.map(i => i.variations).flat())
    .flat()
    .filter(v => !!v.content)
    .map(v => ({ ...v, hash: hashString(v.content!, 8) }));

  // concat with project items
  variations = [
    ...variations,
    ...resume.projects.map(p => ({
      enabled: p.enabled,
      id: p.id,
      content: p.content,
      hash: hashString(p.content || '', 8),
    })),
    ...resume.summaries.map(p => ({
      enabled: p.enabled,
      id: p.id,
      content: p.content,
      hash: hashString(p.content || '', 8),
    })),
  ];

  return outdated ? variations.filter(v => oldItemsScore?.[v.id]?.hash !== v.hash) : variations;
}

export default protectedProcedure
  .input(z.object({ jobResumeId: z.string(), forceCheckAll: z.boolean().optional() }))
  .mutation(async function* ({ input, ctx }) {
    const { jobResumeId, forceCheckAll } = input;
    const user = await currentUser();

    const jobResume = await db.jobResume.findUnique({
      where: {
        id: jobResumeId,
        userId: user?.id,
      },
      include: {
        job: true,
      },
    });

    if (!jobResume) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Job Resume not found.',
      });
    }
    if (!jobResume.job)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The resume has not been attached to a job!',
      });

    // check if job is not analyzed
    let jobAnalyzeResults = jobResume.job.analyzeResults as JobAnalyzeResult;
    try {
      if (!jobAnalyzeResults?.summary) {
        const jobAnalyzeResult = await analyzeJobByAI(jobResume.job.id);
        if (!jobAnalyzeResult.data) {
          throw new Error(jobAnalyzeResult.error?.message || 'Failed to analyze job');
        }
        jobAnalyzeResults = jobAnalyzeResult.data.analyzeResults!;
      }
    } catch (ex) {
      await updateJobResumeStatusFlags(jobResume, {
        analyzingExperiences: 'error',
        analyzingProjects: 'error',
        analyzingSummaries: 'error',
      });
      return;
    }

    try {
      yield await updateJobResumeStatusAndStreamEvent(jobResume, {
        analyzingExperiences: 'pending',
        analyzingProjects: 'pending',
        analyzingSummaries: 'pending',
      });

      const allVariations = getAllResumeItems(jobResume, !forceCheckAll);

      if (allVariations.length === 0) {
        // await wait(20000);
        yield await updateJobResumeStatusAndStreamEvent(
          jobResume,
          {
            analyzingExperiences: 'done',
            analyzingProjects: 'done',
            analyzingSummaries: 'error',
          },
          jobResume.analyzeResults as ResumeAnalyzeResults,
        );
        return;
      }

      const chunks = chunkArray(allVariations, 10);

      let processedChunks = 0;
      const results = [];

      // Process chunks sequentially to show progress
      for (const chunk of chunks) {
        const chunkResult = await analyzeResumeItemScoreAndKeywords(
          jobAnalyzeResults,
          chunk.map(v => `${v.id} - ${v.content}`).join('\n\n'),
        );

        results.push(chunkResult);
        processedChunks++;
      }

      const scores = results.map(res => res.result as ResumeItemScoreAnalyze[]).flat();

      const scoresMap = scores.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.id]: {
            ...curr,
            hash: hashString(allVariations.find(v => curr.id === v.id)?.content || '', 8),
          },
        }),
        {},
      );

      const resumeAnalyzeResults = jobResume.analyzeResults as ResumeAnalyzeResults;
      const newAnalyzeResults = {
        ...resumeAnalyzeResults,
        itemsScore: {
          ...resumeAnalyzeResults.itemsScore,
          ...scoresMap,
        },
      };

      await db.jobResume.update({
        where: { id: jobResumeId },
        data: {
          analyzeResults: newAnalyzeResults,
        },
      });

      yield await updateJobResumeStatusAndStreamEvent(
        jobResume,
        {
          analyzingExperiences: 'done',
          analyzingProjects: 'done',
          analyzingSummaries: 'done',
        },
        newAnalyzeResults as ResumeAnalyzeResults,
      );

      // return newAnalyzeResults;
    } catch (ex) {
      await updateJobResumeStatusFlags(jobResume, {
        analyzingExperiences: 'error',
        analyzingProjects: 'error',
        analyzingSummaries: 'error',
      });

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong.',
        cause: ex,
      });
    }
  });
