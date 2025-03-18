// middleware.ts
import { authConfig } from '@/auth/config';
import NextAuth from 'next-auth';
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from '@/routes';
import { NextRequest, NextResponse } from 'next/server';
import { HttpException, InternalServerErrorException } from '@/lib/exceptions';

export const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  try {
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

    return null;
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';

    // Handle HTTP exceptions
    if (error instanceof HttpException) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: error.message,
          statusCode: error.statusCode,
          ...(isDev && { stack: error.stack }),
        }),
        {
          status: error.statusCode,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const internalError = new InternalServerErrorException(
      error instanceof Error ? error.message : 'An unexpected error occurred',
    );
    const stack = isDev && error instanceof Error ? error.stack : undefined;

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: internalError.message,
        statusCode: internalError.statusCode,
        stack,
      }),
      {
        status: internalError.statusCode,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
