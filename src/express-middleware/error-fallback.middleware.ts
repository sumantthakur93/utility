import { IError } from "../error";
import { Express, Request, Response, NextFunction } from "express";
import logger from "../libs/logger";

export const errorFallback = (app: Express) => {
  app.use((error: IError, req: Request, res: Response, next: NextFunction) => {
    // Link the error to monitoring.
    // This is necessary to catch any unhandled errors
    logger.error(
      `Unhandled error - ${error.message} with stack trace: ${error.stack}`
    );
    res.status(500).json({
      message: `Oops! Something went wrong.`,
    });
    next();
  });
};
