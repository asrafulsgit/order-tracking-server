// src/app/modules/order/order.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as orderService from "./order.service";
import type { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from "./order.validation";

// POST /orders
export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.placeOrder(req.user!.id, req.body as CreateOrderDto);
  ApiResponse.created(res, order, "Order placed successfully");
});

// GET /orders/my
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orders, pagination } = await orderService.getMyOrders(
    req.user!.id,
    req.query as unknown as OrderQueryDto
  );
  ApiResponse.paginated(res, orders, pagination, "Orders fetched successfully");
});

// GET /orders/dashboard
export const getUserDashboard = asyncHandler(async (req: Request, res: Response) => {
  const dashboard = await orderService.getUserDashboard(req.user!.id);
  ApiResponse.success(res, dashboard, "Dashboard data fetched successfully");
});

// GET /orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id as string, req.user!.id);
  ApiResponse.success(res, order, "Order fetched successfully");
});

// PATCH /orders/:id/cancel
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(req.params.id as string, req.user!.id);
  ApiResponse.success(res, order, "Order cancelled successfully");
});

// ─── Admin Controllers ─────────────────────────────────────────────────────────

// GET /orders  [Admin]
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { orders, pagination } = await orderService.getAllOrders(
    req.query as unknown as OrderQueryDto
  );
  ApiResponse.paginated(res, orders, pagination, "All orders fetched successfully");
});

// PATCH /orders/:id/status  [Admin]
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    req.params.id as string,
    req.body as UpdateOrderStatusDto
  );
  ApiResponse.success(res, order, `Order status updated to ${order.status}`);
});

// GET /orders/:id/admin  [Admin - can view any order]
export const getOrderByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id as string); // no userId check
  ApiResponse.success(res, order, "Order fetched successfully");
});
