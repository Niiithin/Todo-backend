import "./config-env";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const JWT_SECRET = process.env.SECRETKEY as string;

export function generateToken(userId: Types.ObjectId) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "24h",
  });
}
