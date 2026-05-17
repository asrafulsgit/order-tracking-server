// src/app/modules/user/user.validation.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
});

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().trim().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  is_active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sortBy: z.enum(["name", "email", "created_at"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type AdminUserQueryDto = z.infer<typeof adminUserQuerySchema>;
