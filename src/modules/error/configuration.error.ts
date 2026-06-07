import { HttpError } from "#modules/error/http.error.js";

export class ConfigurationError extends HttpError {
  constructor(message: string) {
    super(500, "configuration error", message);
    this.name = "ConfigurationError";
  }
}
