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
  });

export { handler as GET, handler as POST };
