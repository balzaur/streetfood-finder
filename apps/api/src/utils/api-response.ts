import { Response } from "express";

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      limit: number;
      offset: number;
      total?: number;
    };
    [key: string]: any;
  };
}

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiSuccessResponse<T>["meta"]
): Response => {
  const response: ApiSuccessResponse<T> = {
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  meta?: ApiSuccessResponse<T>["meta"]
): Response => {
  return sendSuccess(res, data, 201, meta);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response => {
  const response: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};
