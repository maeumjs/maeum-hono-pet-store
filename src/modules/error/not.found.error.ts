import { HttpError } from "#modules/error/http.error.js";

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, "not found", message);
    this.name = "NotFoundError";
  }
}
