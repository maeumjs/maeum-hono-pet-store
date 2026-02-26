import { OpenAPIHono } from '@hono/zod-openapi';

export function initApp(): OpenAPIHono {
  const app = new OpenAPIHono();

  return app;
}
