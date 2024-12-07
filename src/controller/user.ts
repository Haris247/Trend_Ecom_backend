import { NextFunction, Response, Request } from "express";
import { RequestBody } from "../types/types.js";
import { User } from "../models/user.js";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/error-class.js";

// route-----> /api/v1/user/new createUser
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, RequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { _id, email, gender, name, photo, dob } = req.body;

    if (_id) {
      const user = await User.findById(_id);
      if (user) {
        return res.status(200).json({
          success: "true",
          message: `Welcome ${user.name}`,
        });
      }
    }

    if (!_id || !email || !gender || !name || !photo || !dob) {
      return next(new ErrorHandler("all fields are required", 400));
    }
    const user = await User.create({
      _id,
      name,
      email,
      photo,
      gender,
      dob: new Date(dob),
    });
    res.status(200).json({
      success: "true",
      user,
    });
  }
);

// route-----> /api/v1/user/:id getSingleUser
export const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
      message: "true",
      user,
    });
  }
);

// route-----> /api/v1/user/:id deleteUser
export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    await user.delete();
    res.status(200).json({
      success: "true",
      message: "user deleted successfully",
    });
  }
);

// route-----> /api/v1/user/all  getAllUsers
export const getAllUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();
    if (!users) {
      return next(new ErrorHandler("Error while fetching data", 404));
    }
    res.status(200).json({
      success: "true",
      users,
    });
  }
);
