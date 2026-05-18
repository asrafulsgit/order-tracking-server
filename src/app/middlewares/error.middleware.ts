// src/app/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { env } from "../config/env.config";

/**
 * Global error handling middleware.
 * Translates all error types into consistent ApiResponse error payloads.
 *
 * Handles:
 *  - ApiError (operational errors we explicitly throw)
 *  - ZodError (validation failures)
 *  - Prisma errors (database constraint violations, not found, etc.)
 *  - JWT errors (covered by ApiError in jwt.utils.ts)
 *  - Unknown / unexpected errors
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Already sent a response
  if (res.headersSent) return;

  // ─── Our custom operational errors ─────────────────────────────────────────
  if (err instanceof ApiError) {
    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.errors,
      env.isDev ? err.stack : undefined,
    );
    return;
  }

  // ─── Zod validation errors ──────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err?.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    ApiResponse.error(res, "Validation failed", 422, errors);
    return;
  }

  // ─── Prisma errors ──────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint violation
        const fields = (err.meta?.target as string[])?.join(", ") ?? "field";
        ApiResponse.error(
          res,
          `A record with this ${fields} already exists`,
          409,
        );
        return;
      }
      case "P2025":
        // Record not found
        const message = err.meta?.modelName
          ? `${err.meta.modelName} not found`
          : "Record not found"; 
        ApiResponse.error(res, message, 404);
        return;
      case "P2003":
        // Foreign key constraint failure
        ApiResponse.error(res, "Related record does not exist", 400);
        return;
      case "P2014":
        ApiResponse.error(res, "The provided ID is not valid", 400);
        return;
      default:
        ApiResponse.error(
          res,
          "Database operation failed",
          500,
          env.isDev ? [{ code: err.code, message: err.message }] : undefined,
        );
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    ApiResponse.error(res, "Invalid data provided to database", 400);
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    ApiResponse.error(res, "Database connection failed", 503);
    return;
  }

  // ─── SyntaxError (malformed JSON body) ─────────────────────────────────────
  if (err instanceof SyntaxError && "body" in err) {
    ApiResponse.error(res, "Invalid JSON in request body", 400);
    return;
  }

  // ─── Fallback: unexpected errors ────────────────────────────────────────────
  const message = env.isProd
    ? "An unexpected error occurred"
    : err instanceof Error
      ? err.message
      : "Unknown error";

  ApiResponse.error(
    res,
    message,
    500,
    undefined,
    env.isDev && err instanceof Error ? err.stack : undefined,
  );
};

// ─── 404 Not Found Handler ─────────────────────────────────────────────────────
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
