import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { REQUEST_ID_HEADER } from './constants';

/**
 * Gets the current request ID from the headers
 * Can be used in server components and API routes
 */
export async function getRequestId(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get(REQUEST_ID_HEADER) || 'unknown';
  } catch (_) {
    // Headers() might not be available in certain contexts
    return 'unknown';
  }
}

/**
 * Generates a request ID compatible with Edge runtime
 * This function doesn't rely on Node.js crypto module
 */
export function generateRequestId(): string {
  // Create a base-36 random string (alphanumeric)
  const randomPart = Math.random().toString(36).substring(2, 10);

  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);

  // Combine and take first 8 characters
  return `${timestamp.slice(-4)}${randomPart.slice(0, 4)}`;
}

/**
 * Gets the request ID from a NextRequest object
 * Useful in middleware or API handlers when you have the request object
 */
export function getRequestIdFromRequest(req: NextRequest): string {
  return req.headers.get(REQUEST_ID_HEADER) || 'unknown';
}

/**
 * Utility to set request ID in headers for fetch requests
 */
export async function createHeadersWithRequestId(
  additionalHeaders: HeadersInit = {},
): Promise<Headers> {
  const requestId = await getRequestId();
  const headers = new Headers(additionalHeaders);

  // Only add if we have a valid request ID
  if (requestId !== 'unknown') {
    headers.set(REQUEST_ID_HEADER, requestId);
  }

  return headers;
}
