import { router } from '@/server/trpc';
import getStatusFlags from './getStatusFlags';

export const jobResumesRouter = router({
  getStatusFlags,
});
