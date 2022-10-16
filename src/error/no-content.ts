import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class NoContent extends BaseError {
  /**
   * @message {string} The error message
   * @description {string} The error description
   */
  constructor(message: string, desc?: string) {
    const description = desc ?? `Not found: ${message}`;
    super({
      httpCode: StatusCodes.NO_CONTENT,
      isOperational: true,
      message,
      description,
    });
  }
}
