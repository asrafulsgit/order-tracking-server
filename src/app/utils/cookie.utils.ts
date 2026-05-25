// src/app/utils/cookie.utils.ts
import { Response } from "express";
import { env } from "../config/env.config";

// ─── Cookie Configuration ──────────────────────────────────────────────────────
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
}

export interface TokenCookies {
  accessToken: string;
  refreshToken: string;
}

// ─── Token Age Configuration (in seconds) ──────────────────────────────────────
const TOKEN_AGES = {
  ACCESS_TOKEN: 60 * 60, // 1 hour in seconds
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

// ─── Default Cookie Options ────────────────────────────────────────────────────
const getDefaultCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

// ─── Set Token Cookies ─────────────────────────────────────────────────────────
export function setTokenCookies(
  res: Response,
  tokens: TokenCookies,
  options: CookieOptions = {},
): void {
  const cookieOptions = { ...getDefaultCookieOptions(), ...options };

  // Set access token cookie (1 hour)
  if (tokens.accessToken) {
    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: TOKEN_AGES.ACCESS_TOKEN * 1000,
    });
  }

  // Set refresh token cookie (7 days)
  // if (tokens.refreshToken) {
  //   res.cookie("refreshToken", tokens.refreshToken, {
  //     ...cookieOptions,
  //     maxAge: TOKEN_AGES.REFRESH_TOKEN * 1000, // Convert to milliseconds
  //   });
  // }
}

// ─── Clear Token Cookies ───────────────────────────────────────────────────────
export function clearTokenCookies(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
}

// ─── Get Cookie Age in Milliseconds ────────────────────────────────────────────
export function getTokenCookieAge(tokenType: keyof typeof TOKEN_AGES): number {
  return TOKEN_AGES[tokenType] * 1000;
}
