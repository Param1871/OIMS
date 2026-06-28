/**
 * HAL OIMS — Application Constants & Environment Config
 * Phase 3: Centralized env validation and constants
 */

import dotenv from 'dotenv';

dotenv.config();

// ── Validate required environment variables ───────────────────────────────────
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

// ── Parsed environment object ─────────────────────────────────────────────────
export const env = {
  // Server
  NODE_ENV:    process.env.NODE_ENV    || 'development',
  PORT:        parseInt(process.env.PORT || '5000', 10),
  APP_NAME:    process.env.APP_NAME    || 'HAL OIMS',
  APP_URL:     process.env.APP_URL     || '192.168.1.100',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET:           process.env.JWT_SECRET!,
  JWT_EXPIRES_IN:       process.env.JWT_EXPIRES_IN        || '8h',
  JWT_REFRESH_SECRET:   process.env.JWT_REFRESH_SECRET    || process.env.JWT_SECRET!,
  JWT_REFRESH_EXPIRES:  process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS — comma-separated list of allowed origins
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),

  // Uploads
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  UPLOAD_DIR:       process.env.UPLOAD_DIR || './uploads',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX:       parseInt(process.env.RATE_LIMIT_MAX       || '500', 10),

  // Email (optional)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@hal-oims.local',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR:   process.env.LOG_DIR   || './logs',

  // Feature flags
  IS_PRODUCTION:  process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

// ── Application constants ─────────────────────────────────────────────────────
export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE:      1,
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE:     200,

  // Auth
  BCRYPT_ROUNDS:        12,
  MAX_LOGIN_ATTEMPTS:   5,
  LOCKOUT_MINUTES:      30,
  PASSWORD_MIN_LENGTH:  8,

  // Number prefixes for auto-generated codes
  PR_PREFIX:  'PR',
  PO_PREFIX:  'PO',
  GRN_PREFIX: 'GRN',
  TXN_PREFIX: 'TXN',
  WO_PREFIX:  'WO',
  MI_PREFIX:  'MI',
  MR_PREFIX:  'MR',
  SCH_PREFIX: 'SCH',
  CAL_PREFIX: 'CAL',
  REP_PREFIX: 'REP',

  // Roles (mirror of Prisma enum for use without import cycle)
  ROLES: {
    SUPER_ADMIN:           'SUPER_ADMIN',
    INVENTORY_MANAGER:     'INVENTORY_MANAGER',
    STORE_KEEPER:          'STORE_KEEPER',
    PURCHASE_DEPARTMENT:   'PURCHASE_DEPARTMENT',
    PRODUCTION_DEPARTMENT: 'PRODUCTION_DEPARTMENT',
    QUALITY_DEPARTMENT:    'QUALITY_DEPARTMENT',
    MAINTENANCE_DEPARTMENT:'MAINTENANCE_DEPARTMENT',
    FINANCE_DEPARTMENT:    'FINANCE_DEPARTMENT',
    AUDITOR:               'AUDITOR',
    READ_ONLY:             'READ_ONLY',
  } as const,

  // Modules (for RBAC + audit)
  MODULES: {
    AUTH:          'auth',
    INVENTORY:     'inventory',
    WAREHOUSE:     'warehouse',
    PURCHASE:      'purchase',
    VENDOR:        'vendor',
    TRANSACTION:   'transaction',
    PRODUCTION:    'production',
    MAINTENANCE:   'maintenance',
    EMPLOYEE:      'employee',
    REPORT:        'report',
    AUDIT:         'audit',
    NOTIFICATION:  'notification',
    SETTINGS:      'settings',
  } as const,

  // Actions (for RBAC)
  ACTIONS: {
    CREATE:  'create',
    READ:    'read',
    UPDATE:  'update',
    DELETE:  'delete',
    APPROVE: 'approve',
    REJECT:  'reject',
    EXPORT:  'export',
    IMPORT:  'import',
  } as const,

  // Socket.IO event names
  SOCKET_EVENTS: {
    // Inventory
    INVENTORY_UPDATED:    'inventory:updated',
    INVENTORY_CREATED:    'inventory:created',
    INVENTORY_DELETED:    'inventory:deleted',
    // Stock
    STOCK_CHANGED:        'stock:changed',
    STOCK_LOW:            'stock:low',
    STOCK_OUT:            'stock:out',
    // Purchase
    PR_CREATED:           'pr:created',
    PR_APPROVED:          'pr:approved',
    PO_CREATED:           'po:created',
    GRN_POSTED:           'grn:posted',
    // Transfer
    TRANSFER_COMPLETED:   'transfer:completed',
    // Notification
    NOTIFICATION_NEW:     'notification:new',
    // System
    CONNECTED:            'connection',
    DISCONNECTED:         'disconnect',
    JOIN_ROOM:            'join:room',
  } as const,
} as const;