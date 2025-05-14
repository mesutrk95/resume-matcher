import { z } from 'zod';

export const jobResumeStatusFlagState = z.enum(['none', 'done', 'error', 'pending']);

export const jobResumeStatusFlags = z.object({
  analyzingExperiences: jobResumeStatusFlagState.optional(),
  analyzingProjects: jobResumeStatusFlagState.optional(),
  analyzingSummaries: jobResumeStatusFlagState.optional(),
  analyzingEducations: jobResumeStatusFlagState.optional(),
});
