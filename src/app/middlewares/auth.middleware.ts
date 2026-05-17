// src/app/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { extractBearerToken, verifyAccessToken } from "../utils/jwt.utils";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Verifies the JWT access token and attaches the authenticated
 * user object to req.user for downstream middleware/routes.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw ApiError.unauthorized("No authentication token provided");
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, is_active: true },
    });

    if (!user) {
      throw ApiError.unauthorized("User account not found");
    }

    if (!user.is_active) {
      throw ApiError.forbidden("Your account has been deactivated. Contact support.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  }
);
