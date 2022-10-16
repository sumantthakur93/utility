import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class BadRequest extends BaseError {
  /**
   *
   */
  constructor(message: string) {
    const description = `Invalid request: ${message}`;
    super({
      httpCode: StatusCodes.BAD_REQUEST,
      isOperational: true,
      message,
      description,
    });
  }
}
