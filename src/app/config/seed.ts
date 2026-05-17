// prisma/seed.ts
import { PrismaClient, FoodCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clean existing data ────────────────────────────────────────────────────
  await prisma.order.deleteMany();
  await prisma.food.deleteMany();
  await prisma.user.deleteMany();

  // ─── Seed Users ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@ordertrack.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Karim Ahmed",
      email: "karim@gmail.com",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Sara Khan",
      email: "sara@gmail.com",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log(`✅ Created ${3} users`);

  // ─── Seed Foods ─────────────────────────────────────────────────────────────
  const foods = await prisma.food.createMany({
    data: [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato, fresh mozzarella, and basil.",
        price: 12.5,
        category: FoodCategory.Pizza,
        image_url:
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800",
        available: true,
      },
      {
        name: "Pepperoni Pizza",
        description: "Loaded with spicy pepperoni and mozzarella cheese.",
        price: 14.0,
        category: FoodCategory.Pizza,
        image_url:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
        available: true,
      },
      {
        name: "Classic Burger",
        description:
          "Juicy beef patty with lettuce, tomato, and special sauce.",
        price: 9.99,
        category: FoodCategory.Burger,
        image_url:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        available: true,
      },
      {
        name: "Cheese Burger",
        description: "Double cheese patty with caramelized onions.",
        price: 11.5,
        category: FoodCategory.Burger,
        image_url:
          "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
        available: true,
      },
      {
        name: "Salmon Sushi Roll",
        description: "Fresh salmon with cucumber and avocado in sushi rice.",
        price: 16.0,
        category: FoodCategory.Sushi,
        image_url:
          "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
        available: true,
      },
      {
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with pancetta, egg, and parmesan.",
        price: 13.5,
        category: FoodCategory.Pasta,
        image_url:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
        available: true,
      },
      {
        name: "Caesar Salad",
        description: "Romaine lettuce, croutons, and Caesar dressing.",
        price: 8.5,
        category: FoodCategory.Salad,
        image_url:
          "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
        available: true,
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center.",
        price: 7.0,
        category: FoodCategory.Dessert,
        image_url:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
        available: true,
      },
      {
        name: "Fresh Lemonade",
        description: "Chilled lemonade with mint and ice.",
        price: 4.5,
        category: FoodCategory.Drink,
        image_url:
          "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
        available: true,
      },
      {
        name: "Pad Thai",
        description: "Stir-fried rice noodles with shrimp, peanuts, and lime.",
        price: 13.0,
        category: FoodCategory.Asian,
        image_url:
          "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
        available: false,
      },
    ],
  });

  console.log("\n🎉 Seeding complete!");
  console.log("──────────────────────────────");
  console.log("Admin credentials:");
  console.log("  Email:    admin@ordertrack.com");
  console.log("  Password: password123");
  console.log("User credentials:");
  console.log("  Email:    karim@gmail.com");
  console.log("  Password: password123");
}

main();
