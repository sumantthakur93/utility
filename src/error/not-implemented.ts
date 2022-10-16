import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class NotImplemented extends BaseError {
  /**
   * @message {string} The error message
   * @description {string} The error description
   */
  constructor(message: string, desc?: string) {
    const description = desc ?? `Not Implemented: ${message}`;
    super({
      httpCode: StatusCodes.NOT_IMPLEMENTED,
      isOperational: true,
      message,
      description,
    });
  }
}
