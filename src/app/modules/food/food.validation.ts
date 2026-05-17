// src/app/modules/food/food.validation.ts
import { z } from "zod";
import { FoodCategory } from "@prisma/client";

export const createFoodSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(1000),
  price: z
    .number({ error: "Price must be a number" })
    .positive("Price must be positive")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),
  category: z.enum(FoodCategory, {
    error: () => ({ message: `Category must be one of: ${Object.values(FoodCategory).join(", ")}` }),
  }),
  image_url: z.string().url("Invalid image URL").optional().nullable(),
  available: z.boolean().optional().default(true),
});

export const updateFoodSchema = createFoodSchema.partial();

export const foodQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().trim().optional(),
  category: z.nativeEnum(FoodCategory).optional(),
  available: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(["name", "price", "created_at"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateFoodDto = z.infer<typeof createFoodSchema>;
export type UpdateFoodDto = z.infer<typeof updateFoodSchema>;
export type FoodQueryDto = z.infer<typeof foodQuerySchema>;
