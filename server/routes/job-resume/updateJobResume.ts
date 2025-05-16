import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { resumeContentSchema } from '@/schemas/resume';
import { protectedProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export default protectedProcedure
  .input(
    z.object({
      jobResumeId: z.string(),
      content: resumeContentSchema.optional(),
      templateId: z.string().optional(),
      name: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const user = await currentUser();
    if (!user?.emailVerified) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Email not verified.',
      });
    }
    const { jobResumeId, ...otherProps } = input;

    await db.jobResume.update({
      where: {
        id: jobResumeId,
        userId: user?.id,
      },
      data: {
        ...otherProps,
        updatedAt: new Date(),
      },
    });
  });
