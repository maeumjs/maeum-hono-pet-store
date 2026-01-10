import { randomUUID } from 'node:crypto';

import { getAsyncStore } from '#/modules/loggings/stores/getAsyncStore';

export function getAsyncTid(): string {
  const store = getAsyncStore();

  if (store?.tid == null) {
    return `unde${randomUUID().substring(4)}`;
  }

  return store.tid;
}
