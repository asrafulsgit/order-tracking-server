// src/app/utils/ApiResponse.ts
import { Response } from "express";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface SuccessResponsePayload<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

interface ErrorResponsePayload {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown[];
  stack?: string;
}

export class ApiResponse {
  // ─── Success Responses ───────────────────────────────────────────────────────
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200,
    meta?: PaginationMeta | Record<string, unknown>
  ): Response {
    const payload: SuccessResponsePayload<T> = {
      success: true,
      statusCode,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message = "Created successfully"): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated<T>(
    res: Response,
    data: T,
    pagination: PaginationMeta,
    message = "Fetched successfully"
  ): Response {
    // Set pagination headers for easy client consumption
    res.setHeader("X-Total-Count", pagination.total);
    res.setHeader("X-Page", pagination.page);
    res.setHeader("X-Per-Page", pagination.limit);
    return ApiResponse.success(res, data, message, 200, pagination);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  // ─── Error Responses ─────────────────────────────────────────────────────────
  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown[],
    stack?: string
  ): Response {
    const payload: ErrorResponsePayload = {
      success: false,
      statusCode,
      message,
      ...(errors?.length && { errors }),
      ...(stack && { stack }),
    };
    return res.status(statusCode).json(payload);
  }
}

// ─── Pagination Helper ──────────────────────────────────────────────────────────
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// ─── Parse Pagination Query ────────────────────────────────────────────────────
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(query.limit ?? "10"), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
