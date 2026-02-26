import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '#/modules/hook/default.hook';
import { onError } from '#/modules/hook/on.error';

export function initApp(): OpenAPIHono {
  const app = new OpenAPIHono({ defaultHook });

  app.onError(onError);

  return app;
}
