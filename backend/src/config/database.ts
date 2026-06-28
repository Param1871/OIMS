/**
 * HAL OIMS — Prisma Client Singleton
 * Phase 3: Single database connection instance across the application
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// ── Singleton pattern prevents multiple connections in development (HMR) ──────
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  // Log slow queries (>1000ms) in development
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e) => {
      if (e.duration > 1000) {
        logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });
  }

  client.$on('error', (e) => {
    logger.error('Prisma error:', e);
  });

  client.$on('warn', (e) => {
    logger.warn('Prisma warning:', e);
  });

  return client;
};

// Use global singleton in development to survive HMR
export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;