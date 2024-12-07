import { Response, Request, NextFunction } from "express";
import { ErrorHandler } from "../utils/error-class.js";
import { funController } from "../types/types.js";
export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (err.message = err.message || "internal server error"),
    (err.status = err.status || 500);
  res.status(err.status).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch =
  (func: funController) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await Promise.resolve(func(req, res, next)).catch(next);
  };
