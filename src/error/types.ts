import { StatusCodes } from "http-status-codes";

export interface IError {
  isOperational: boolean;
  httpCode: StatusCodes;
  stack?: string;
  message: string;
  description: string;
}
