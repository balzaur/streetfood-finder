/**
 * HTTP Error Codes
 */
export enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  BAD_REQUEST = "BAD_REQUEST",

  // Server Errors (5xx)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
}

/**
 * Base HTTP Error class
 */
export class HttpError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: any;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", details?: any) {
    super(400, ErrorCode.BAD_REQUEST, message, details);
  }
}

/**
 * 400 Validation Error
 */
export class ValidationError extends HttpError {
  constructor(message: string = "Validation failed", details?: any) {
    super(400, ErrorCode.VALIDATION_ERROR, message, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized", details?: any) {
    super(401, ErrorCode.UNAUTHORIZED, message, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden", details?: any) {
    super(403, ErrorCode.FORBIDDEN, message, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found", details?: any) {
    super(404, ErrorCode.NOT_FOUND, message, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends HttpError {
  constructor(message: string = "Resource conflict", details?: any) {
    super(409, ErrorCode.CONFLICT, message, details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends HttpError {
  constructor(message: string = "Internal server error", details?: any) {
    super(500, ErrorCode.INTERNAL_ERROR, message, details);
  }
}

/**
 * 501 Not Implemented
 */
export class NotImplementedError extends HttpError {
  constructor(message: string = "Not implemented", details?: any) {
    super(501, ErrorCode.NOT_IMPLEMENTED, message, details);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message: string = "Service unavailable", details?: any) {
    super(503, ErrorCode.SERVICE_UNAVAILABLE, message, details);
  }
}
