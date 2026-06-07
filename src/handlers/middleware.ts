import { serveStatic } from "@hono/node-server/serve-static";
import { requestId } from "hono/request-id";

import { container } from "#app/loader.js";
import { defaultHook } from "#modules/hook/default.hook.js";
import { onError } from "#modules/hook/on.error.js";
import { asyncContextMiddleware } from "#modules/middleware/async.context.middleware.js";
import { httpLoggingMiddleware } from "#modules/middleware/http.logging.middleware.js";

export function middleware(): void {
  // configuration default hook
  container.app.defaultHook = defaultHook;
  // add hook for error processing
  container.app.onError(onError);

  container.app.use("*", requestId());
  container.app.use("/static/*", serveStatic({ root: "./public" }));

  // AsyncLocalStorage context middleware (must be before other middlewares)
  container.app.use("*", asyncContextMiddleware());

  // HTTP request/response logging middleware
  container.app.use("*", httpLoggingMiddleware());
}
