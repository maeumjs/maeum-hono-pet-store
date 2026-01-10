import { executionAsyncResource } from 'node:async_hooks';

import type { IAsyncStore } from '#/servers/interfaces/IAsyncStore';

export function getAsyncStore() {
  const acquiredExecutionAsyncResource = executionAsyncResource() as Record<
    string | symbol,
    unknown
  >;
  const keys = Object.getOwnPropertySymbols(acquiredExecutionAsyncResource);
  const store = keys
    .map((key) => acquiredExecutionAsyncResource[key])
    .find((element): element is IAsyncStore => typeof element === 'object' && element != null);

  return store;
}
