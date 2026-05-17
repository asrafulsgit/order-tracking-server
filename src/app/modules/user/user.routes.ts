// src/app/modules/user/user.routes.ts
import { Router } from "express";
import { z } from "zod";
import * as userController from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updateProfileSchema, adminUserQuerySchema } from "./user.validation";

const router = Router();

router.use(authenticate);

// ─── User Routes ───────────────────────────────────────────────────────────────
/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update own profile (name)
 * @access  Private
 */
router.patch("/profile", validate(updateProfileSchema), userController.updateProfile);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
/**
 * @route   GET /api/v1/users
 * @desc    Get all users with search, filter, pagination
 * @access  Admin
 */
router.get("/", adminOnly, validate(adminUserQuerySchema, "query"), userController.getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user details with order history
 * @access  Admin
 */
router.get("/:id", adminOnly, userController.getUserById);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Change user role (USER/ADMIN)
 * @access  Admin
 */
router.patch(
  "/:id/role",
  adminOnly,
  validate(z.object({ role: z.enum(["USER", "ADMIN"]) })),
  userController.changeUserRole
);

export default router;
