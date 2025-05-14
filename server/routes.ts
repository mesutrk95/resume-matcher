import { router } from './trpc';

import { jobResumesRouter } from './routes/job-resume';
import { jobsRouter } from './routes/job';

export const appRouter = router({
  jobResume: jobResumesRouter,
  job: jobsRouter,
});

export type AppRouter = typeof appRouter;
