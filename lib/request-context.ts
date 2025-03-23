// lib/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Define the structure of our request context
export interface RequestContext {
  requestId: string;
  timestamp: number;
  url?: string;
  [key: string]: any; // Allow for additional context properties
}

// Create a new AsyncLocalStorage instance for our request context
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Middleware to set request context
 * This allows any response type that middleware can return
 */
export function withRequestContext(
  handler: (
    request: NextRequest,
    context: RequestContext,
  ) => Promise<Response | NextResponse | null> | Response | NextResponse | null,
) {
  return (request: NextRequest) => {
    // Generate a new request ID for this request
    const requestId = crypto.randomUUID().slice(0, 8);

    // Create the initial context for this request
    const context: RequestContext = {
      requestId,
      timestamp: Date.now(),
      url: request.nextUrl.pathname,
    };

    // Run the handler with the context
    return asyncLocalStorage.run(context, async () => {
      const response = await handler(request, context);

      // If we have a response, set the request ID header
      if (response) {
        // Handle different response types
        if (response instanceof NextResponse) {
          response.headers.set('X-Request-ID', requestId);
        } else if (response instanceof Response) {
          // For standard Response objects, we need to create a new Response
          // with the modified headers since Response headers are immutable
          const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
          newResponse.headers.set('X-Request-ID', requestId);
          return newResponse;
        }
      }

      return response;
    });
  };
}

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Get the current request ID
 */
export function getRequestId(): string {
  const context = getRequestContext();
  return context?.requestId || 'unknown';
}

/**
 * Add data to the current request context
 */
export function setRequestContextData(key: string, value: any): void {
  const context = getRequestContext();
  if (context) {
    context[key] = value;
  }
}
