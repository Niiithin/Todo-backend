import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "../utils/config-env";
import { User } from "../model/user.model";

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const decoded = jwt.verify(
      token,
      process.env.SECRETKEY as string
    ) as JwtPayload;
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error, "error");
    return res.status(400).json({
      success: false,
      message: "Authentication Failed",
    });
  }
};
