// src/app/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

type ValidationTarget = "body" | "query" | "params";

/**
 * Validates req[target] against a Zod schema.
 * Returns structured 422 errors on failure.
 */
export const validate =
  (schema: ZodSchema, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace with sanitized/coerced values from Zod
      if (target === "query") {
        // req.query is read-only, so use Object.assign to update it
        Object.assign(req.query, parsed);
      } else {
        (req as any)[target] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code,
        }));
        return next(new ApiError(422, "Validation failed", errors));
      }
      next(err);
    }
  };
