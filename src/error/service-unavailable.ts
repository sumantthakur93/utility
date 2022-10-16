import { StatusCodes } from "http-status-codes";
import { BaseError } from "./base-error";

export class ServiceUnavailable extends BaseError {
  /**
   * @message {string} The error message
   * @description {string} The error description
   */
  constructor(message: string, desc?: string) {
    const description = desc ?? `Service Unavailable: ${message}`;
    super({
      httpCode: StatusCodes.SERVICE_UNAVAILABLE,
      isOperational: true,
      message,
      description,
    });
  }
}
