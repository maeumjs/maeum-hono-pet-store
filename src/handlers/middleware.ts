import { serveStatic } from '@hono/node-server/serve-static';
import { requestId } from 'hono/request-id';

import { container } from '#/loader';
import { asyncContextMiddleware } from '#/modules/middleware/async.context.middleware';
import { httpLoggingMiddleware } from '#/modules/middleware/http.logging.middleware';

export function middleware(): void {
  container.app.use('*', requestId());
  container.app.use('/static/*', serveStatic({ root: './public' }));

  // AsyncLocalStorage context middleware (must be before other middlewares)
  container.app.use('*', asyncContextMiddleware());

  // HTTP request/response logging middleware
  container.app.use('*', httpLoggingMiddleware());
}
