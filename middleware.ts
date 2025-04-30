// middleware.ts
import { authConfig } from '@/auth/config';
import NextAuth from 'next-auth';
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';
import { runWithRequestContext } from '@/lib/request-context';

export const { auth } = NextAuth(authConfig);

// Create a global store for the request context
import { REQUEST_ID_HEADER } from '@/lib/constants';

export default async function middleware(req: NextRequest) {
  // Generate a request ID
  const requestId = generateRequestId();

  // Use the request context mechanism
  return runWithRequestContext(requestId, async () => {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(REQUEST_ID_HEADER, requestId);

    const { nextUrl } = req;
    const session = await auth();
    const isLoggedIn = !!session;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    if (isApiAuthRoute) {
      return null;
    }

    const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoutes = authRoutes.includes(nextUrl.pathname);

    if (isAuthRoutes) {
      if (isLoggedIn) {
        return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
      }
      return null;
    }

    if (!isLoggedIn && !isPublicRoutes) {
      const targetUrl = new URL(req.url);
      const url = new URL(`/login`, req.url);
      if (targetUrl.pathname !== 'login')
        url.searchParams.set(
          'redirect',
          targetUrl.pathname + '?' + targetUrl.searchParams.toString(),
        );

      return Response.redirect(url);
    }

    // Continue with the request but with the added requestId header
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    // Also add requestId to response headers
    response.headers.set(REQUEST_ID_HEADER, requestId);

    return response;
  });
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [
    '/((?!api/webhooks|.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api(?!/webhooks).*)',
    '/(trpc)(.*)',
  ],
};

function generateRequestId(): string {
  let id = '';

  id += Date.now().toString(36);

  while (id.length < 32) {
    id += Math.random().toString(36).substring(2);
  }

  return id.slice(0, 32);
}
