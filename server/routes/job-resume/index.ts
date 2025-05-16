import { router } from '@/server/trpc';
import getStatusFlags from './getStatusFlags';
import analyzeResumeContent from './analyzeResumeContent';
import updateJobResume from './updateJobResume';
import createJobResume from './createJobResume';
import deleteJobResume from './deleteJobResume';
import connectJobResumeToJob from './connectJobResumeToJob';

export const jobResumesRouter = router({
  getStatusFlags,
  analyzeResumeContent,
  createJobResume,
  updateJobResume,
  deleteJobResume,
  connectJobResumeToJob,
});
