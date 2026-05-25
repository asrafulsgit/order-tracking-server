// src/app/config/socket.config.ts
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "./env.config";
import { verifyAccessToken } from "../utils/jwt.utils";
import { Role } from "@prisma/client";

/**
 * Socket.io Configuration with production-grade settings
 */
export const getSocketConfig = () => {
  return {
    cors: {
      origin: env.ALLOWED_ORIGINS || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    // Performance settings
    // transports: ["websocket", "polling"],
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    // Memory settings for production
    maxHttpBufferSize: 1e6, // 1MB
    // Per-socket settings
    serveClient: false, // Don't serve socket.io client script
  };
};

/**
 * Extract access token from cookies or Authorization header
 */
const extractAccessToken = (socket: Socket): string | null => {
  // Try to get token from Authorization header (Bearer token)
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  // Try to get token from cookies
  const cookies = socket.handshake.headers.cookie;
  if (cookies) {
    const cookiePairs = cookies.split("; ");
    const accessTokenCookie = cookiePairs.find(
      (cookie: string) =>
        cookie.startsWith("accessToken=") || cookie.startsWith("access_token="),
    );
    if (accessTokenCookie) {
      return accessTokenCookie.split("=")[1];
    }
  }

  return null;
};

let io: Server;

/**
 * Initialize Socket.io with configuration
 */
export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, getSocketConfig());
  console.log("✓ Socket.io initialized with server");

  // Middleware for authentication
  io.use((socket, next) => {
    try {
      const token = extractAccessToken(socket);

      if (!token) {
        return next(new Error("No access token provided"));
      }

      // Verify JWT token
      const decoded = verifyAccessToken(token); 
      if (!decoded) {
        return next(new Error("Invalid or expired access token"));
      }

      // Attach user info to socket for use in event handlers
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // console.log(`Connected: ${socket.userEmail}`);

    // Join user room
    if (socket.userRole === Role.USER) {
      socket.join(socket.userId);
      console.log(`User joined ${socket.userId}`);
    }
    
    // Join admin room
    if (socket.userRole === Role.ADMIN) {
      socket.join("admins");
      console.log(`Admin joined ${socket.userId}`);
    }

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.userEmail}`);
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.io has not been initialized. Call setIO(io) first.",
    );
  }
  return io;
};
