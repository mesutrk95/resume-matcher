import { jobResumeStatusFlags, jobResumeStatusFlagState } from '@/schemas/job-resume';
import { z } from 'zod';

export type JobResumeStatusFlags = z.infer<typeof jobResumeStatusFlags>;
export type JobResumeStatusFlagState = z.infer<typeof jobResumeStatusFlagState>;
