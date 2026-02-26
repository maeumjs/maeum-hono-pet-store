import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '#/modules/event/default.hook';
import { onError } from '#/modules/event/on.error';

export function initApp(): OpenAPIHono {
  const app = new OpenAPIHono({ defaultHook });

  app.onError(onError);

  return app;
}
