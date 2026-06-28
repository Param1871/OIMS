/**
 * HAL OIMS — Server Entry Point
 * Phase 3: Backend Development
 * Creates HTTP server, attaches Socket.IO, starts listening on LAN
 */

import http from 'http';
import app from './app';
import { initializeSocket } from './config/socket';
import { logger } from './config/logger';
import { env } from './config/constants';
import { prisma } from './config/database';

const PORT = env.PORT;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
initializeSocket(server);

// Start server — bind to 0.0.0.0 for LAN accessibility
server.listen(PORT, '0.0.0.0', async () => {
  logger.info('═══════════════════════════════════════════════════════');
  logger.info('  HAL OIMS — Online Inventory Management System');
  logger.info('  Hindustan Aeronautics Limited (Inspired)');
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`🚀  Server     → http://0.0.0.0:${PORT}`);
  logger.info(`🌐  LAN URL    → http://${env.APP_URL}:${PORT}`);
  logger.info(`📡  Socket.IO  → Real-time updates enabled`);
  logger.info(`📦  Database   → PostgreSQL via Prisma ORM`);
  logger.info(`🔐  Auth       → JWT (${env.JWT_EXPIRES_IN} expiry)`);
  logger.info(`🌍  Env        → ${env.NODE_ENV}`);
  logger.info('═══════════════════════════════════════════════════════');

  // Verify database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅  Database connection verified');
  } catch (error) {
    logger.error('❌  Database connection failed:', error);
    process.exit(1);
  }
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`\n🛑  Received ${signal}. Gracefully shutting down...`);

  server.close(async () => {
    logger.info('🔌  HTTP server closed');
    await prisma.$disconnect();
    logger.info('🗄️   Database connection closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('⚠️   Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejections and exceptions
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;