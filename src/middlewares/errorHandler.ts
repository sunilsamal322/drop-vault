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
    res.status(400).json({
      message: "Validation failed",
      errors: error.flatten(),
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal Server Error",
  });
}
