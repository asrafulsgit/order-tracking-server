// src/app/modules/admin/admin.routes.ts
import { Router } from "express";
import * as adminController from "./admin.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/role.middleware";

const router = Router();

// All admin routes: must be authenticated AND admin
router.use(authenticate, adminOnly);

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get comprehensive admin dashboard with all KPIs
 * @access  Admin
 */
router.get("/dashboard", adminController.getDashboard);

/**
 * @route   GET /api/v1/admin/analytics/revenue?days=30
 * @desc    Get daily revenue breakdown for N days (7-90)
 * @access  Admin
 */
router.get("/analytics/revenue", adminController.getRevenueAnalytics);

export default router;
