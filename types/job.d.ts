import { z } from 'zod';
import { jobKeywordTypeSchema, jobKeywordSchema, jobAnalyzeResultSchema } from '@/schemas/job';

// Infer types from Zod schemas
type JobKeywordType = z.infer<typeof jobKeywordTypeSchema>; // "hard" | "soft" | "none"
type JobKeyword = z.infer<typeof jobKeywordSchema>;
type JobAnalyzeResult = z.infer<typeof jobAnalyzeResultSchema>;

// Export inferred types
export type { JobKeywordType, JobKeyword, JobAnalyzeResult };
