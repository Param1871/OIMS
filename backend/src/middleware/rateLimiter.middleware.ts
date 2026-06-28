/**
 * HAL OIMS — Rate Limiter Middleware
 * Phase 3: Prevent brute-force attacks and API abuse
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/constants';

/** General API rate limiter */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
  },
});

/** Strict limiter for auth endpoints (login, password reset) */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
    timestamp: new Date().toISOString(),
  },
});

/** Limiter for export endpoints (prevent large dumps) */
export const exportRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many export requests. Please wait a minute.',
    timestamp: new Date().toISOString(),
  },
});