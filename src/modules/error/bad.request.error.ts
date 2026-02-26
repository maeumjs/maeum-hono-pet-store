import { HttpError } from '#/modules/error/http.error';

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, 'bad request', message);
    this.name = 'BadRequestError';
  }
}
