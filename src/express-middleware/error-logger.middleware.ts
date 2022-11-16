import { IError } from "../error";
import { Express, Request, Response, NextFunction } from "express";
import logger from "../libs/logger";

export const errorLogger = (app: Express) => {
  app.use((error: IError, req: Request, _res: Response, next: NextFunction) => {
    logger.error(`Error while calling route - ${req.originalUrl}`);
    logger.error(`Error message: ${error.message}`);
    logger.error(
      `Error description: ${error.description}, stack trace - ${error.stack}`
    );
    next(error);
  });
};
