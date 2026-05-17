// src/app/utils/jwt.utils.ts
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "./ApiError";

export interface JwtPayload {
  sub: string;        
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── Generate Tokens ───────────────────────────────────────────────────────────
export function generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: "HS256",
  } as SignOptions);
}

export function generateRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: "HS256",
  } as SignOptions);
}

// ─── Verify Tokens ─────────────────────────────────────────────────────────────
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Access token has expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid access token");
    }
    throw ApiError.unauthorized("Token verification failed");
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Refresh token has expired, please login again");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid refresh token");
    }
    throw ApiError.unauthorized("Refresh token verification failed");
  }
}

// ─── Extract Bearer Token ──────────────────────────────────────────────────────
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7) || null;
}

// ─── Generate Token Pair ───────────────────────────────────────────────────────
export function generateTokenPair(payload: Omit<JwtPayload, "iat" | "exp">) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
