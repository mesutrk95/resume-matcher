import { db } from '@/lib/db';
import { protectedProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      jobResumeId: z.string(),
      jobId: z.string(),
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
    const { jobId, jobResumeId } = input;

    const job = await db.job.findUnique({
      where: { id: jobId, userId: user.id },
      select: { id: true },
    });

    if (!job) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Job not found.',
      });
    }
    // Update job in database
    const updatedJob = await db.jobResume.update({
      where: {
        id: jobResumeId,
        userId: user.id,
      },
      data: {
        jobId: job.id,
        updatedAt: new Date(),
      },
    });

    return updatedJob;
  });
