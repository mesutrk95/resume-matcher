// middleware.ts
import { authConfig } from '@/auth/config';
import NextAuth from 'next-auth';
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes';
import { NextRequest, NextResponse } from 'next/server';
import { HttpException, InternalServerErrorException } from '@/lib/exceptions';
import { runWithRequestContext } from '@/lib/request-context';

export const { auth } = NextAuth(authConfig);

// Create a global store for the request context
const REQUEST_ID_HEADER = 'X-Request-ID';

export default async function middleware(req: NextRequest) {
  // Generate a request ID
  const requestId = generateRequestId();

  // Use the request context mechanism
  return runWithRequestContext(requestId, async () => {
    try {
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
        return Response.redirect(new URL('/login', nextUrl));
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
    } catch (error) {
      const isDev = process.env.NODE_ENV === 'development';

      // Handle HTTP exceptions
      if (error instanceof HttpException) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: error.message,
            statusCode: error.statusCode,
            requestId,
            ...(isDev && { stack: error.stack }),
          }),
          {
            status: error.statusCode,
            headers: {
              'Content-Type': 'application/json',
              [REQUEST_ID_HEADER]: requestId,
            },
          },
        );
      }

      const internalError = new InternalServerErrorException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );

      return new NextResponse(
        JSON.stringify({
          success: false,
          message: internalError.message,
          statusCode: internalError.statusCode,
          requestId,
          stack: isDev && error instanceof Error ? error.stack : undefined,
        }),
        {
          status: internalError.statusCode,
          headers: {
            'Content-Type': 'application/json',
            [REQUEST_ID_HEADER]: requestId,
          },
        },
      );
    }
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
