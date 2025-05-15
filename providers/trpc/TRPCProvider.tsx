'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpBatchStreamLink, loggerLink } from '@trpc/client';
import React, { ReactNode, useState } from 'react';
import { trpc } from '.';
import { observable } from '@trpc/server/observable';
import { toast } from 'sonner';

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        runtime => {
          return ({ op, next }) => {
            // You can do something before the request is sent
            console.log(`Making request to ${op.path} with input:`, op.input);

            // Process the response or catch errors
            return observable(observer => {
              const unsubscribe = next(op).subscribe({
                next(result) {
                  console.log('here', observer);

                  // Handle successful response
                  observer.next(result);
                },
                error(err) {
                  // Handle errors here (like an interceptor)
                  console.error('tRPC error intercepted:', err);

                  // // You can transform the error
                  // if (err.data?.code === 'NOT_FOUND') {
                  //   console.log('Resource not found error handled');
                  //   // Maybe navigate to a 404 page or show a specific notification
                  // }

                  err?.message && toast.error(err?.message);
                  // You can also modify the error before passing it to the caller
                  // or even swallow it completely if you don't call observer.error

                  // Pass the error to the caller (optional - remove this if you want to swallow the error)
                  observer.error(err);
                },
                complete() {
                  observer.complete();
                },
              });

              return unsubscribe;
            });
          };
        },
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
        httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      // transformer: superjson,
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
