import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class Conflict extends BaseError {
  /**
   * @message {string} The error message
   * @description {string} The error description
   */
  constructor(message: string, desc?: string) {
    const description = desc ?? `Duplicate field: ${message}`;
    super({
      httpCode: StatusCodes.CONFLICT,
      isOperational: true,
      message,
      description,
    });
  }
}
