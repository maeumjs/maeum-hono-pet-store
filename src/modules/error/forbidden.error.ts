import { HttpError } from '#/modules/error/http.error';

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, 'forbidden', message);
    this.name = 'ForbiddenError';
  }
}
