import { currentUser } from '@/lib/auth';
import { protectedProcedure } from '@/server/trpc';
import { getJobResumeStatusFlags } from '@/services/job-resume';
import { z } from 'zod';

export default protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
  const user = await currentUser();
  return getJobResumeStatusFlags(input, user?.id);
});
