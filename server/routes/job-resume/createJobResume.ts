import { protectedProcedure } from '@/server/trpc';
import { createJobResume } from '@/services/job-resume';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      careerProfileId: z.string().optional(),
      jobId: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx.session;
    if (!user?.emailVerified) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Email not verified.',
      });
    }

    const { careerProfileId, jobId } = input;

    return createJobResume(user.id!, careerProfileId, jobId);
  });
