import { HttpError } from '#/modules/error/http.error';

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, 'not found', message);
    this.name = 'NotFoundError';
  }
}
