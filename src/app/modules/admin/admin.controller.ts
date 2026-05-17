// src/app/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as adminService from "./admin.service";

// GET /admin/dashboard
export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const dashboard = await adminService.getAdminDashboard();
  ApiResponse.success(res, dashboard, "Admin dashboard fetched successfully");
});

// GET /admin/analytics/revenue?days=30
export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(90, Math.max(7, parseInt(String(req.query.days ?? "30"), 10)));
  const analytics = await adminService.getRevenueAnalytics(days);
  ApiResponse.success(res, analytics, "Revenue analytics fetched successfully");
});
