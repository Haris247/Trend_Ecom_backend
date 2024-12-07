import { TryCatch } from "./error.js";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/error-class.js";

export const adminAuth = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("Admin Credenials Required", 404));
    }
    if (user.role !== "admin") {
      return next(
        new ErrorHandler("Your are not authorized to access this resource", 404)
      );
    }
    next();
  }
);
