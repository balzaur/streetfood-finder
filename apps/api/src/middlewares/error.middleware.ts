import { Request, Response, NextFunction } from "express";
import { HttpError, ErrorCode } from "../utils/http-errors.js";
import { sendError } from "../utils/api-response.js";
import { config } from "../config/env.js";

/**
 * Centralized error handling middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (config.isDevelopment) {
    console.error("Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  // Handle known HTTP errors
  if (err instanceof HttpError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Handle unexpected errors
  sendError(
    res,
    500,
    ErrorCode.INTERNAL_ERROR,
    config.isDevelopment ? err.message : "An unexpected error occurred",
    config.isDevelopment ? { stack: err.stack } : undefined
  );
};
