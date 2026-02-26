import { HttpError } from '#/modules/error/http.error';

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, 'unauthorized', message);
    this.name = 'UnauthorizedError';
  }
}
