import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class BadRequest extends BaseError {
  /**
   * @message {string} The error message
   * @description {string} The error description
   */
  constructor(message: string, desc?: string) {
    const description = desc ?? `Invalid request: ${message}`;
    super({
      httpCode: StatusCodes.BAD_REQUEST,
      isOperational: true,
      message,
      description,
    });
  }
}
