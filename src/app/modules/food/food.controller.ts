// src/app/modules/food/food.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as foodService from "./food.service";
import type { CreateFoodDto, UpdateFoodDto, FoodQueryDto } from "./food.validation";

// GET /foods
export const getAllFoods = asyncHandler(async (req: Request, res: Response) => {
  const { foods, pagination } = await foodService.getAllFoods(req.query);
  ApiResponse.paginated(res, foods, pagination, "Foods fetched successfully");
});

// GET /foods/categories
export const getFoodCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await foodService.getFoodCategories();
  ApiResponse.success(res, categories, "Categories fetched successfully");
});

// GET /foods/:id
export const getFoodById = asyncHandler(async (req: Request, res: Response) => {
  const food = await foodService.getFoodById(req.params.id as string);
  ApiResponse.success(res, food, "Food item fetched successfully");
});

// POST /foods  [Admin]
export const createFood = asyncHandler(async (req: Request, res: Response) => {
  const food = await foodService.createFood(req.body as CreateFoodDto);
  ApiResponse.created(res, food, "Food item created successfully");
});

// PUT /foods/:id  [Admin]
export const updateFood = asyncHandler(async (req: Request, res: Response) => {
  const food = await foodService.updateFood(req.params.id as string, req.body as UpdateFoodDto);
  ApiResponse.success(res, food, "Food item updated successfully");
});

// PATCH /foods/:id/toggle  [Admin]
export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const food = await foodService.toggleAvailability(req.params.id as string);
  ApiResponse.success(
    res,
    food,
    `Food item is now ${food.available ? "available" : "unavailable"}`
  );
});

// DELETE /foods/:id  [Admin]
export const deleteFood = asyncHandler(async (req: Request, res: Response) => {
  await foodService.deleteFood(req.params.id as string);
  ApiResponse.success(res, null, "Food item deleted successfully");
});
