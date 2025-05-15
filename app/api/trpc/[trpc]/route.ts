import { appRouter } from '@/server/routes';
import { createContext } from '@/server/context';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const dynamic = 'force-dynamic';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError(opts) {
      const { error, type, path, input, ctx, req } = opts;
      // console.error('Error:', error);
      // if (error.code === 'INTERNAL_SERVER_ERROR') {
      //   // send to bug reporting
      // }
    },
  });

export { handler as GET, handler as POST };
