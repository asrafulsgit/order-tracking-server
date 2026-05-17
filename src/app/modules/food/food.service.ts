// src/app/modules/food/food.service.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta } from "../../utils/ApiResponse";
import type {
  CreateFoodDto,
  UpdateFoodDto,
  FoodQueryDto,
} from "./food.validation";

// ─── Get All Foods (with search/filter/sort/pagination) ───────────────────────
export async function getAllFoods(query: Record<string, any>) {
  let {
    page,
    limit,
    search,
    category,
    available,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
  } = query;
  page = page || 1;
  limit = limit || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.FoodWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && { category }),
    ...(available !== undefined && { available }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const [foods, total] = await prisma.$transaction([
    prisma.food.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.food.count({ where }),
  ]);

  return { foods, pagination: buildPaginationMeta(total, page, limit) };
}

// ─── Get Food by ID ────────────────────────────────────────────────────────────
export async function getFoodById(id: string) {
  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) throw ApiError.notFound(`Food item with ID "${id}" not found`);
  return food;
}

// ─── Get Food Categories Summary ───────────────────────────────────────────────
export async function getFoodCategories() {
  const grouped = await prisma.food.groupBy({
    by: ["category"],
    _count: { id: true },
    where: { available: true },
    orderBy: { _count: { id: "desc" } },
  });

  return grouped.map((g) => ({
    category: g.category,
    count: g._count.id,
  }));
}

// ─── Create Food (Admin) ───────────────────────────────────────────────────────
export async function createFood(dto: CreateFoodDto) {
  const existing = await prisma.food.findFirst({
    where: { name: { equals: dto.name, mode: "insensitive" } },
  });
  if (existing)
    throw ApiError.conflict(`Food item "${dto.name}" already exists`);

  return prisma.food.create({ data: dto });
}

// ─── Update Food (Admin) ───────────────────────────────────────────────────────
export async function updateFood(id: string, dto: UpdateFoodDto) {
  await getFoodById(id); // ensures it exists
  return prisma.food.update({ where: { id }, data: dto });
}

// ─── Toggle Food Availability (Admin) ─────────────────────────────────────────
export async function toggleAvailability(id: string) {
  const food = await getFoodById(id);
  return prisma.food.update({
    where: { id },
    data: { available: !food.available },
  });
}

// ─── Delete Food (Admin) ───────────────────────────────────────────────────────
export async function deleteFood(id: string) {
  await getFoodById(id);

  // Check if food has any active (non-completed/cancelled) orders
  const activeOrders = await prisma.order.count({
    where: {
      food_id: id,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
  });

  if (activeOrders > 0) {
    throw ApiError.conflict(
      `Cannot delete food with ${activeOrders} active order(s). Cancel or complete them first.`,
    );
  }

  return prisma.food.delete({ where: { id } });
}
