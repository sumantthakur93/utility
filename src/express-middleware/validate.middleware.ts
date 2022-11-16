import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AnyZodObject } from "zod";

interface IParsed {
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
}

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: IParsed = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      }) as IParsed;
      req.params = data.params;
      req.query = data.query;
      req.body = data.body;
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST).json(error.errors);
    }
  };
