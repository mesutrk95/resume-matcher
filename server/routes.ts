import { db } from '@/lib/db';
import { procedure, protectedProcedure, router } from './trpc';
import { z } from 'zod';
import { getJobResumeStatusFlags } from '@/actions/job-resume';

export const appRouter = router({
  getJobResumeStatusFlags: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return getJobResumeStatusFlags(input);
  }),
  getMe: protectedProcedure.input(z.string()).query(async opts => {
    const { input } = opts;
    const user = await db.user.findUnique({ where: { id: opts.ctx.session.user?.id } });
    return user;
  }),
  health: procedure.query(() => {
    return { state: 'healthy' };
  }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
