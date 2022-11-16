import { IError } from "../error";
import { Express, Request, Response, NextFunction } from "express";

export const errorResponse = (app: Express) => {
  app.use((error: IError, req: Request, res: Response, next: NextFunction) => {
    if (error.httpCode) {
      res.status(error.httpCode).json({ message: error.message });
    } else {
      next(error);
    }
  });
};
