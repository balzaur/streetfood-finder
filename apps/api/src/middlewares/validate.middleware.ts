import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/http-errors.js";

/**
 * Validate request data against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError("Validation failed", details);
      }
      next(error);
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError("Validation failed", details);
      }
      next(error);
    }
  };
};

/**
 * Validate only request params
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError("Validation failed", details);
      }
      next(error);
    }
  };
};

/**
 * Validate only request query
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        throw new ValidationError("Validation failed", details);
      }
      next(error);
    }
  };
};
