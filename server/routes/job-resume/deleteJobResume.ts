import { db } from '@/lib/db';
import { protectedProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export default protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
  const { user } = ctx.session;
  if (!user?.emailVerified) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Email not verified.',
    });
  }
  await db.jobResume.delete({
    where: { id: input, userId: user.id! },
  });

  return true;
});
