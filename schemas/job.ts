import { z } from 'zod';

const jobKeywordTypeSchema = z.enum(['hard', 'soft', 'none']);

const jobKeywordSchema = z.object({
  keyword: z.string(),
  level: z.number(),
  skill: jobKeywordTypeSchema,
});

const jobAnalyzeResultSchema = z.object({
  keywords: z.array(jobKeywordSchema),
  summary: z.string(),
});

export { jobKeywordTypeSchema, jobKeywordSchema, jobAnalyzeResultSchema };
