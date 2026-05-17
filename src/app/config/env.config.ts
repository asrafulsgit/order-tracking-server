// src/app/config/env.config.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─── Validate Required Env Vars ────────────────────────────────────────────────
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

// ─── Env Config Object ─────────────────────────────────────────────────────────
export const env = {
  NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") ?? "development",
  PORT: parseInt(process.env.PORT ?? "5000", 10),
  API_PREFIX: process.env.API_PREFIX ?? "/api/v1",

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",

  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "12", 10),

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000").split(","),

  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV === "development",
} as const;
