import { container } from '#/loader';

import type { MiddlewareHandler } from 'hono';

export function httpLoggingMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    // Clone request BEFORE next() - just reference, no parsing
    const requestContentType = c.req.header('content-type') ?? '';
    const contentLength = Number.parseInt(c.req.header('content-length') ?? '0', 10);
    const clonedRequest = c.req.raw.clone();
    const startedAt = Date.now();

    // Log incoming request
    container.logger.info(
      {
        req_id: c.get('requestId'),
        method: c.req.method,
        url: c.req.path,
        params: c.req.param(),
        content_type: requestContentType,
        content_length: contentLength,
      },
      'Request received',
    );

    await next();

    // Parse request body AFTER next()
    const isDevelopment = container.config.server.runMode !== 'production';
    let requestBody: unknown;

    // Skip parsing if content is too large (> 10MB)
    const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

    try {
      if (contentLength > MAX_BODY_SIZE) {
        requestBody = `[Body too large: ${contentLength} bytes, skipped logging]`;
      } else if (requestContentType.includes('application/json')) {
        requestBody = await clonedRequest.json();
      } else if (requestContentType.includes('text/')) {
        requestBody = await clonedRequest.text();
      } else if (
        requestContentType.includes('application/x-www-form-urlencoded') ||
        requestContentType.includes('multipart/form-data')
      ) {
        const formData = await clonedRequest.formData();
        const formObject: Record<string, unknown> = {};

        formData.forEach((value, key) => {
          if (value instanceof File) {
            formObject[key] = `[File: ${value.name}, size: ${value.size} bytes]`;
          } else {
            formObject[key] = value;
          }
        });

        requestBody = formObject;
      }
    } catch {
      requestBody = '[unable to read body]';
    }

    // Parse response body AFTER next()
    const clonedResponse = c.res.clone();
    const responseContentType = clonedResponse.headers.get('content-type') ?? '';
    let responseBody: unknown;

    try {
      if (responseContentType.includes('application/json')) {
        responseBody = await clonedResponse.json();
      } else if (responseContentType.includes('text/')) {
        responseBody = await clonedResponse.text();
      }
    } catch {
      responseBody = '[unable to read body]';
    }

    const logData: Record<string, unknown> = {
      status: clonedResponse.status,
      content_type: responseContentType,
      req_id: c.get('requestId'),
      method: c.req.method,
      url: c.req.path,
      params: c.req.param(),
      elapsed_ms: Date.now() - startedAt,
      req: requestBody,
    };

    // Log response body only in development mode
    if (isDevelopment) {
      logData.res = responseBody;
    }

    container.logger.info(logData, 'Response sent');
  };
}
