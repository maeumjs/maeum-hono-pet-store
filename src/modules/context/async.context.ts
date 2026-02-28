import { AsyncLocalStorage } from 'node:async_hooks';

export interface IAsyncContext {
  requestId?: string;
  uid?: string;
  // Add more context properties as needed
}

export const asyncContext = new AsyncLocalStorage<IAsyncContext>();

export function getRequestId(): string | undefined {
  return asyncContext.getStore()?.uid ?? asyncContext.getStore()?.requestId;
}

export function getContext(): IAsyncContext | undefined {
  return asyncContext.getStore();
}
