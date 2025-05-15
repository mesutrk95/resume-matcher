import { router } from '@/server/trpc';
import getStatusFlags from './getStatusFlags';
import analyzeResumeContent from './analyzeResumeContent';

export const jobResumesRouter = router({
  getStatusFlags,
  analyzeResumeContent,
});
