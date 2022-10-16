import { StatusCodes } from "http-status-codes";
import { IError } from "./types";

export class BaseError extends Error {
  public readonly httpCode: StatusCodes;
  public readonly isOperational: boolean;
  public readonly description: string;
  public readonly stack: string | undefined;
  /**
   * Creates a new error object with the given message and error properties
   */
  constructor({
    message,
    description,
    httpCode,
    isOperational,
    stack,
  }: IError) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.description = description;
    this.stack = stack;
  }
}
