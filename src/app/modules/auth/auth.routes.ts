// src/app/modules/auth/auth.routes.ts
import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware"; 
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "./auth.validation";

const router = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return tokens
 * @access  Public
 */
router.post("/login", validate(loginSchema), authController.login);


// ─── Protected Routes ──────────────────────────────────────────────────────────
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Invalidate current session (clear refresh token)
 * @access  Private
 */
router.get("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently authenticated user profile
 * @access  Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route   PATCH /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
