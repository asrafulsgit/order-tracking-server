// src/app/middlewares/role.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Role-based access control middleware factory.
 * Must be used AFTER the `authenticate` middleware.
 *
 * Usage:
 *   router.get("/admin-only", authenticate, authorize(Role.ADMIN), handler)
 *   router.get("/any-auth",   authenticate, authorize(Role.USER, Role.ADMIN), handler)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): [${allowedRoles.join(", ")}]. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

// ─── Convenience Shorthand Middlewares ────────────────────────────────────────
export const adminOnly = authorize(Role.ADMIN);
export const userOnly = authorize(Role.USER);
export const anyRole = authorize(Role.USER, Role.ADMIN);
