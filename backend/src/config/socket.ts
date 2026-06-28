/**
 * HAL OIMS — Socket.IO Configuration
 * Phase 3: Real-time event handling for inventory updates, notifications, etc.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env, CONSTANTS } from './constants';
import { logger } from './logger';

let io: SocketServer;

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  roleId?: string;
  roleName?: string;
}

interface JWTPayload {
  userId: string;
  username: string;
  roleId: string;
  roleName: string;
}

// ── Initialize Socket.IO on HTTP server ───────────────────────────────────────
export const initializeSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  // ── JWT Authentication middleware ───────────────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      socket.userId   = decoded.userId;
      socket.username = decoded.username;
      socket.roleId   = decoded.roleId;
      socket.roleName = decoded.roleName;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ──────────────────────────────────────────────────────
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`🔌 Socket connected: ${socket.username} (${socket.id})`);

    // Join role-based room — broadcasts go to specific roles
    if (socket.roleName) {
      socket.join(`role:${socket.roleName}`);
    }

    // Join personal room for direct notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join global room — all authenticated users
    socket.join('global');

    // Handle custom room join requests
    socket.on(CONSTANTS.SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
      socket.join(room);
      logger.debug(`Socket ${socket.username} joined room: ${room}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.username} — ${reason}`);
    });

    // Send initial connection ack
    socket.emit('connected', {
      message: 'Connected to HAL OIMS real-time server',
      userId: socket.userId,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('📡 Socket.IO initialized');
  return io;
};

// ── Emit helpers (called from services) ──────────────────────────────────────

/**
 * Broadcast to ALL connected clients
 */
export const broadcastToAll = (event: string, data: unknown): void => {
  if (!io) return;
  io.to('global').emit(event, data);
};

/**
 * Broadcast to a specific role
 */
export const broadcastToRole = (
  roleName: string,
  event: string,
  data: unknown
): void => {
  if (!io) return;
  io.to(`role:${roleName}`).emit(event, data);
};

/**
 * Send to a specific user
 */
export const emitToUser = (
  userId: string,
  event: string,
  data: unknown
): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit inventory stock change to all users — triggers real-time table update
 */
export const emitStockChange = (payload: {
  itemId: string;
  itemCode: string;
  itemName: string;
  newQuantity: number;
  transactionType: string;
}): void => {
  broadcastToAll(CONSTANTS.SOCKET_EVENTS.STOCK_CHANGED, payload);

  // Also emit low-stock warning if applicable
  if (payload.newQuantity <= 0) {
    broadcastToAll(CONSTANTS.SOCKET_EVENTS.STOCK_OUT, payload);
  }
};

/**
 * Get the Socket.IO instance (for use in routes/services)
 */
export const getSocketIO = (): SocketServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};