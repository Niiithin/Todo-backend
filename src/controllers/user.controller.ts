import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../model/user.model";
import { generateToken } from "../utils/generate-token";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = generateToken(newUser._id);
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully", token });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    res.json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
