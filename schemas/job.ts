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

const JobDescriptionSchema = z.object({
  description: z.string().describe('HTML formatted job description'),
  companyName: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location is required'),
  title: z.string().min(1, 'Job title is required'),
  postedDate: z
    .string()
    .regex(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/, 'Date must be in YYYY/MM/DD HH:mm format')
    .describe('Date when the job was posted'),
});

// Type inference
export type JobDescription = z.infer<typeof JobDescriptionSchema>;

const KeywordSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  skill: z.enum(['hard', 'soft', 'none'], {
    description: 'Category of skill: hard, soft, or neither',
  }),
  level: z
    .number()
    .min(0, 'Importance level must be at least 0')
    .max(1, 'Importance level must be at most 1')
    .describe('Importance level from 0 to 1, where 1 is highly important'),
});

const JobAnalysisSchema = z
  .array(KeywordSchema)
  .nonempty('Analysis must contain at least one keyword');

// Type inference
export type KeywordAnalysis = z.infer<typeof KeywordSchema>;
export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

export {
  jobKeywordTypeSchema,
  jobKeywordSchema,
  jobAnalyzeResultSchema,
  JobDescriptionSchema,
  KeywordSchema,
  JobAnalysisSchema,
};
