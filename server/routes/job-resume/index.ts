import { router } from '@/server/trpc';
import getStatusFlags from './getStatusFlags';
import analyzeResumeContent from './analyzeResumeContent';
import updateJobResume from './updateJobResume';

export const jobResumesRouter = router({
  getStatusFlags,
  analyzeResumeContent,
  updateJobResume,
});
