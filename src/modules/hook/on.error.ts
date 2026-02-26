import { HttpError } from '#/modules/error/http.error';

import type { ErrorHandler } from 'hono';

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { code: err.code, message: err.message },
      err.statusCode as 400 | 401 | 403 | 404 | 500,
    );
  }

  return c.json({ code: 'internal server error', message: err.message }, 500);
};
