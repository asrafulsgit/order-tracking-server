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
    const token =
      extractBearerToken(req.headers.authorization) || req.cookies.accessToken;

    if (!token) {
      throw ApiError.unauthorized("No authentication token provided");
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true, 
        created_at : true,
        updated_at : true
      },
    });
  
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  },
);
