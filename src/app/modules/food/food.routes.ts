// src/app/modules/food/food.routes.ts
import { Router } from "express";
import * as foodController from "./food.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { adminOnly } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createFoodSchema, updateFoodSchema, foodQuerySchema } from "./food.validation";

const router = Router();

// ─── Public / Auth User Routes ─────────────────────────────────────────────────
 
router.get("/", foodController.getAllFoods);

/**
 * @route   GET /api/v1/foods/categories
 * @desc    Get all food categories with item count
 * @access  Private
 */
router.get("/categories", authenticate, foodController.getFoodCategories);

/**
 * @route   GET /api/v1/foods/:id
 * @desc    Get food item details by ID
 * @access  Private
 */
router.get("/:id", authenticate, foodController.getFoodById);

// ─── Admin Only Routes ─────────────────────────────────────────────────────────
/**
 * @route   POST /api/v1/foods
 * @desc    Create a new food item
 * @access  Admin
 */
router.post("/", authenticate, adminOnly, validate(createFoodSchema), foodController.createFood);

/**
 * @route   PUT /api/v1/foods/:id
 * @desc    Update a food item
 * @access  Admin
 */
router.put(
  "/:id",
  authenticate,
  adminOnly,
  validate(updateFoodSchema),
  foodController.updateFood
);

/**
 * @route   PATCH /api/v1/foods/:id/toggle
 * @desc    Toggle food availability
 * @access  Admin
 */
router.patch("/:id/toggle", authenticate, adminOnly, foodController.toggleAvailability);

/**
 * @route   DELETE /api/v1/foods/:id
 * @desc    Delete a food item (only if no active orders)
 * @access  Admin
 */
router.delete("/:id", authenticate, adminOnly, foodController.deleteFood);

export default router;
