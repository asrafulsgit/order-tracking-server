// src/app/modules/user/user.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as userService from "./user.service";
import type { UpdateProfileDto, AdminUserQueryDto } from "./user.validation";

// PATCH /users/profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body as UpdateProfileDto);
  ApiResponse.success(res, user, "Profile updated successfully");
});

// ─── Admin Controllers ─────────────────────────────────────────────────────────

// GET /users  [Admin]
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { users, pagination } = await userService.getAllUsers(
    req.query as unknown as AdminUserQueryDto
  );
  ApiResponse.paginated(res, users, pagination, "Users fetched successfully");
});

// GET /users/:id  [Admin]
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserByIdAdmin(req.params.id as string);
  ApiResponse.success(res, user, "User fetched successfully");
});

// PATCH /users/:id/role  [Admin]
export const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body as { role: "USER" | "ADMIN" };
  const user = await userService.changeUserRole(req.params.id as string, role, req.user!.id);
  ApiResponse.success(res, user, `User role changed to ${user.role}`);
});
