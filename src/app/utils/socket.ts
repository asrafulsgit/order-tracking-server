// src/app/utils/socket.ts
import { Server } from "socket.io";

/**
 * Global Socket.io instance singleton
 * Access from any module using: import { getIO } from "@/app/utils/socket"
 */
let ioInstance: Server | null = null;

/**
 * Set the Socket.io instance (called from server.ts during initialization)
 */
export const setIO = (io: Server): void => {
  ioInstance = io;
};

/**
 * Get the Socket.io instance from anywhere in the application
 */
export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.io has not been initialized. Call setIO(io) first.");
  }
  return ioInstance;
};

/**
 * Emit an event to a specific user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  const io = getIO();
  io.to(userId).emit(event, data);
};

/**
 * Emit an event to all connected clients
 */
export const emitToAll = (event: string, data: any): void => {
  const io = getIO();
  io.emit(event, data);
};

/**
 * Emit an event to a specific room
 */
export const emitToRoom = (room: string, event: string, data: any): void => {
  const io = getIO();
  io.to(room).emit(event, data);
};

/**
 * Join a user to a room (user_id room)
 */
export const joinUserRoom = (socket: any, userId: string): void => {
  socket.join(userId);
};

/**
 * Leave a user from a room
 */
export const leaveUserRoom = (socket: any, userId: string): void => {
  socket.leave(userId);
};

/**
 * Get all connected sockets in a room
 */
export const getSocketsInRoom = async (room: string): Promise<string[]> => {
  const io = getIO();
  const sockets = await io.to(room).fetchSockets();
  return sockets.map((s) => s.id);
};
