// src/app/utils/ApiError.ts

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(
    statusCode: number,
    message: string,
    errors?: unknown[],
    isOperational = true,
    stack?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Static Factory Methods ─────────────────────────────────────────────────
  static badRequest(message = "Bad request", errors?: unknown[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized - Please login to access") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden - Insufficient permissions") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static unprocessable(message = "Unprocessable entity", errors?: unknown[]) {
    return new ApiError(422, message, errors);
  }

  static tooMany(message = "Too many requests, please try again later") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, undefined, false);
  }
}
