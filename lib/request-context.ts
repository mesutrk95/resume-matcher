import { AsyncLocalStorage } from 'async_hooks';
import { getRequestId } from './request-id';

export const REQUEST_ID_HEADER = 'X-Request-ID';

// Context type that will be stored
export interface RequestContext {
  requestId: string;
  // You can add other request-specific information here in the future
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export async function getCurrentRequestId(): Promise<string> {
  // First, try AsyncLocalStorage
  const context = getRequestContext();
  if (context?.requestId) {
    return context.requestId;
  }

  try {
    const requestId = await getRequestId();
    return requestId;
  } catch (error) {
    console.error('Failed to get request ID from headers:', error);
  }

  return `generated-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

export function runWithRequestContext<T>(requestId: string, fn: () => T): T {
  const context: RequestContext = { requestId };
  return asyncLocalStorage.run(context, fn);
}
