import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { prisma } from "../lib/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Auth Header:", authHeader); // Debug

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      console.log("Decoded token:", decoded); // Debug
    } catch (error) {
      console.error("JWT Error:", error); // Debug
      throw new AppError(401, "Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};