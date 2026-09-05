import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Not found"));
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.code !== undefined ? { code: err.code } : {}),
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (env.NODE_ENV !== "production") {
      console.error(err);
    }

    if (err.code === "P2002") {
      res.status(409).json({
        error: {
          message: "Resource already exists",
        },
      });
      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        error: {
          message: "Not found",
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        message: "Request could not be completed",
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    if (env.NODE_ENV !== "production") {
      console.error(err);
    }

    res.status(400).json({
      error: {
        message: "Invalid request",
      },
    });
    return;
  }

  if (env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
};