// src/app/modules/user/user.service.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/ApiResponse";
import type { UpdateProfileDto, AdminUserQueryDto } from "./user.validation";

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
} as const;

// ─── Update Profile ────────────────────────────────────────────────────────────
export async function updateProfile(userId: string, dto: UpdateProfileDto) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: dto,
    select: safeUserSelect,
  });
}

// ─── Admin: Get All Users ──────────────────────────────────────────────────────
export async function getAllUsers(query: AdminUserQueryDto) {
  const { page, limit, search, role, is_active, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(role && { role }),
    ...(is_active !== undefined && { is_active }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        ...safeUserSelect,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: buildPaginationMeta(total, page, limit) };
}

// ─── Admin: Get User By ID (with order history) ────────────────────────────────
export async function getUserByIdAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...safeUserSelect,
      _count: { select: { orders: true } },
      orders: {
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          food: { select: { id: true, name: true, category: true } },
        },
      },
    },
  });

  if (!user) throw ApiError.notFound("User not found");
  return user;
}

// ─── Admin: Change User Role ───────────────────────────────────────────────────
export async function changeUserRole(
  userId: string,
  role: "USER" | "ADMIN",
  adminId: string
) {
  if (userId === adminId) {
    throw ApiError.badRequest("You cannot change your own role");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: safeUserSelect,
  });
}
