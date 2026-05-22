// src/app/modules/order/order.validation.ts
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  food_id: z
    .string({ error: "Food ID is required" })
    .uuid("Invalid food ID format"),
  quantity: z
    .number({ error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(20, "Cannot order more than 20 items at once"),
  address: z
    .string({ error: "Delivery address is required" })
    .trim()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be at most 500 characters"),
  notes: z
    .string()
    .trim()
    .max(300, "Notes must be at most 300 characters")
    .optional()
    .nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus, {
    error: () => ({
      message: `Status must be one of: ${Object.values(OrderStatus).join(", ")}`,
    }),
  }),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(OrderStatus).optional(),
  search: z.string().trim().optional(), // search by address or food name
  sortBy: z.enum(["created_at", "total", "status"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  from: z.coerce.date().optional(), // date range filter
  to: z.coerce.date().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryDto = z.infer<typeof orderQuerySchema>;
export type CancelOrderDto = z.infer<typeof cancelOrderSchema>;
