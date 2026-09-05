// Backend/src/middleware/auth.middleware.ts

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication required");
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    let decoded: unknown;

    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AppError(401, "Invalid or expired token");
    }

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded) ||
      typeof decoded.userId !== "string"
    ) {
      throw new AppError(401, "Invalid token");
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
