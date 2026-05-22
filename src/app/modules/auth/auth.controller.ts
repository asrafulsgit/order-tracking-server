// src/app/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { setTokenCookies, clearTokenCookies } from "../../utils/cookie.utils";
import * as authService from "./auth.service";
import type { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from "./auth.validation";

// POST /auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterDto);
  ApiResponse.created(res, result, "Account created successfully");
});

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginDto);
  setTokenCookies(res, result.tokens);
  ApiResponse.success(res, null, "Login successful");
});

// POST /auth/refresh
// export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
//   const { refreshToken } = req.body as RefreshTokenDto;
//   const tokens = await authService.refreshTokens(refreshToken);
//   ApiResponse.success(res, tokens, "Tokens refreshed successfully");
// });

// POST /auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearTokenCookies(res); 
  ApiResponse.success(res, null, "Logged out successfully");
});

// GET /auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  ApiResponse.success(res, user, "Profile fetched successfully");
});

// PATCH /auth/change-password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body as ChangePasswordDto);
  ApiResponse.success(res, null, "Password changed successfully. Please login again.");
});
