import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import AppError from "../errors/AppError.js";

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof ZodError) {
    const errors = error.issues.reduce(
      (acc, issue) => {
        const field = issue.path.join(".");
        acc[field] = issue.message;
        return acc;
      },
      {} as Record<string, string>,
    );

    res.status(400).json({
      message: "Validation failed",
      errors,
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
  });
}
