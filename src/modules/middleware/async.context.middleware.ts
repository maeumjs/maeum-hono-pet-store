import { asyncContext } from '#/modules/context/async.context';

import type { MiddlewareHandler } from 'hono';

export function asyncContextMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = c.get('requestId');
    const uid = c.req.query('uid');

    // Run the rest of the request within AsyncLocalStorage context
    await asyncContext.run({ requestId, uid }, async () => {
      await next();
    });
  };
}
