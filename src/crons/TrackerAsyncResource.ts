import { AsyncResource } from 'node:async_hooks';

import { CE_SERVER_DEFAULT_VALUE } from '#/servers/const-enum/CE_SERVER_DEFAULT_VALUE';

export class TrackerAsyncResource extends AsyncResource {
  #tid: string;

  #lang: string | undefined;

  constructor(tid: string, lang: string | undefined, type?: string, triggerAsyncId?: number) {
    super(type ?? CE_SERVER_DEFAULT_VALUE.TRACKING_ID_AC, triggerAsyncId);

    this.#tid = tid;
    this.#lang = lang;
  }

  get tid() {
    return this.#tid;
  }

  get lang() {
    return this.#lang;
  }
}
