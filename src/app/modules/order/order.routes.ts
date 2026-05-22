// src/app/modules/order/order.routes.ts
import { Router } from "express";
import * as orderController from "./order.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { adminOnly, userOnly } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "./order.validation";

const router = Router();

// All order routes require authentication
router.use(authenticate);

// ─── User Routes ───────────────────────────────────────────────────────────────
/**
 * @route   POST /api/v1/orders
 * @desc    Place a new order
 * @access  Private (User)
 */
router.post("/", userOnly, validate(createOrderSchema), orderController.placeOrder);

/**
 * @route   GET /api/v1/orders/my
 * @desc    Get current user's orders with filters
 * @query   page, limit, status, sortBy, sortOrder, from, to
 * @access  Private (User)
 */
router.get(
  "/my",
  userOnly,
  // validate(orderQuerySchema, "query"),
  orderController.getMyOrders,
);

/**
 * @route   GET /api/v1/orders/dashboard
 * @desc    Get user dashboard stats (order counts, spending, recent orders)
 * @access  Private (User)
 */
router.get("/dashboard", orderController.getUserDashboard);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get a specific order by ID (user can only see own)
 * @access  Private (User)
 */
router.get("/:id", orderController.getOrderById);

/**
 * @route   PATCH /api/v1/orders/:id/cancel
 * @desc    Cancel an order (only if status is ORDERED)
 * @access  Private (User)
 */
router.patch("/:id/cancel", orderController.cancelOrder);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
/**
 * @route   GET /api/v1/orders
 * @desc    Get all orders (admin) with search, filter, sort, pagination
 * @query   page, limit, status, search, sortBy, sortOrder, from, to
 * @access  Admin
 */
router.get(
  "/",
  adminOnly,
  // validate(orderQuerySchema, "query"),
  orderController.getAllOrders,
);

/**
 * @route   GET /api/v1/orders/:id/admin
 * @desc    Get any order by ID (admin view)
 * @access  Admin
 */
router.get("/:id/admin", adminOnly, orderController.getOrderByIdAdmin);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Admin
 */
router.patch(
  "/:id/status",
  adminOnly,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
