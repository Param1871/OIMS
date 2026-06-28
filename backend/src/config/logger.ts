/**
 * HAL OIMS — Winston Logger Configuration
 * Phase 3: Structured logging with file rotation and console output
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Ensure log directory exists
const LOG_DIR = process.env.LOG_DIR || './logs';
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ── Custom log format for console output ─────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}${metaStr}`;
});

// ── Logger instance ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'hal-oims-backend' },

  transports: [
    // Console — colorized, human-readable
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    }),

    // Combined log file — all levels
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
    }),

    // Error log file — errors only
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),

    // HTTP access log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'http.log'),
      level: 'http',
      format: combine(timestamp(), json()),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 7,
    }),
  ],

  // Do not exit on unhandled exceptions here — handled in server.ts
  exitOnError: false,
});

// Add http level if not present in winston types
winston.addColors({ http: 'cyan' });

// ── Helper: log with request context ─────────────────────────────────────────
export const logWithContext = (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context: Record<string, unknown> = {}
) => {
  logger.log(level, message, context);
};