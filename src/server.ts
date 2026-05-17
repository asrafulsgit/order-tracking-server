// src/server.ts
import "dotenv/config";
import http from "http";
import app from "./app";
import { env } from "./app/config/env.config";
import { prisma, checkDatabaseConnection } from "./app/utils/prisma";

// ─── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(app);

// ─── Track open connections for graceful shutdown ──────────────────────────────
let openConnections = new Set<import("net").Socket>();

server.on("connection", (socket) => {
  openConnections.add(socket);
  socket.once("close", () => openConnections.delete(socket));
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function gracefulShutdown(signal: string): Promise<void> {
  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }

    console.info("✅ HTTP server closed. No new connections accepted.");

    // Close all existing connections
    for (const socket of openConnections) {
      socket.destroy();
    }
    openConnections.clear();

    // Disconnect Prisma
    try {
      await prisma.$disconnect();
      console.info("✅ Database connection closed.");
    } catch (dbErr) {
      console.error("Error closing database connection:", dbErr);
    }

    console.info("🏁 Graceful shutdown complete.");
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error("⚠️  Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000).unref(); // unref() prevents this timer from keeping the process alive
}

// ─── Process Signal Handlers ──────────────────────────────────────────────────
process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Docker / Kubernetes stop
process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Ctrl+C in terminal
process.on("SIGHUP", () => gracefulShutdown("SIGHUP")); // Terminal closed

// ─── Unhandled Promise Rejections ─────────────────────────────────────────────
process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    console.error("Unhandled Promise Rejection:", { reason, promise });
    // Give the server a chance to finish current requests then exit
    gracefulShutdown("unhandledRejection");
  },
);

// ─── Uncaught Exceptions ───────────────────────────────────────────────────────
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception — process will exit:", {
    message: err.message,
    stack: err.stack,
  });
  // Uncaught exceptions leave the app in an undefined state — always exit
  process.exit(1);
});

// ─── Startup ──────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  console.info("🚀 Starting Order Tracking API...");

  // 1. Verify database connection
  try {
    await checkDatabaseConnection();
    console.info("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }

  // 2. Start HTTP server
  server.listen(env.PORT, () => {
    console.info("─────────────────────────────────────────────");
    console.info(`🌐  Environment  : ${env.NODE_ENV}`);
    console.info(`🔌  Port         : ${env.PORT}`);
    console.info(`📡  API Prefix   : ${env.API_PREFIX}`);
    console.info(`❤️   Health Check : http://localhost:${env.PORT}/health`);
    console.info("─────────────────────────────────────────────");
  });

  // Handle server-level errors (e.g., EADDRINUSE)
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${env.PORT} is already in use`);
    } else {
      console.error("❌ Server error:", err);
    }
    process.exit(1);
  });
}

bootstrap();
