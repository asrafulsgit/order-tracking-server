// src/app.ts
import express, { Application, Request, Response } from "express";
import cors from "cors";  
import cookieParser from "cookie-parser"; 
import { env } from "./app/config/env.config";
import { corsOptions } from "./app/config/cors.config";  
import { errorHandler, notFoundHandler } from "./app/middlewares/error.middleware";

// ─── Route Imports ────────────────────────────────────────────────────────────
import authRoutes from "./app/modules/auth/auth.routes";
import foodRoutes from "./app/modules/food/food.routes";
import orderRoutes from "./app/modules/order/order.routes";
import userRoutes from "./app/modules/user/user.routes";
import adminRoutes from "./app/modules/admin/admin.routes";

const app: Application = express();

// ─── Security Middleware ─────────────────────────────────────────────────────── 
app.use(cors(corsOptions));

// ─── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser()); 

// ─── Trust Proxy (for accurate IP in rate limiter behind nginx/load balancer) ──
app.set("trust proxy", 1); 

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
const API = env.API_PREFIX;

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/foods`, foodRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/admin`, adminRoutes);

// ─── Root Route ────────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "🍕 Order Tracking API",
    version: "1.0.0",
    docs: `${API}/docs`,
    health: "/health",
  });
});

// ─── Error Handlers (must be last) ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
