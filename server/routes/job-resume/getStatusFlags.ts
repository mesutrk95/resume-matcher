import { getJobResumeStatusFlags } from '@/actions/job-resume';
import { protectedProcedure } from '@/server/trpc';
import { z } from 'zod';

export default protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
  return getJobResumeStatusFlags(input);
});
