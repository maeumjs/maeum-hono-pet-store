import { ApiError } from '@maeum/error-controller';
import httpStatusCodes from 'http-status-codes';

import { getAsyncStore } from '#/modules/loggings/stores/getAsyncStore';

import type { II18nParameters } from '@maeum/i18n-controller';

import type { IAsyncStore } from '#/servers/interfaces/IAsyncStore';

export function getAsyncStoreOrThrow(): IAsyncStore {
  const store = getAsyncStore();

  if (store == null) {
    throw new ApiError({
      status: httpStatusCodes.NOT_FOUND,
      i18n: {
        phrase: 'common.main.not-found-store',
      } as II18nParameters,
    });
  }

  return store;
}
