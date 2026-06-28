/**
 * HAL OIMS — Express Application Configuration
 * Phase 3: Middleware chain, route mounting, error handling
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

import { errorHandler } from './middleware/errorHandler.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { logger } from './config/logger';
import { env } from './config/constants';

// ── Route Imports ────────────────────────────────────────────────────────────
import authRoutes        from './modules/auth/auth.routes';
import userRoutes        from './modules/users/user.routes';
import employeeRoutes    from './modules/employees/employee.routes';
import inventoryRoutes   from './modules/inventory/inventory.routes';
import categoryRoutes    from './modules/categories/category.routes';
import warehouseRoutes   from './modules/warehouse/warehouse.routes';
import vendorRoutes      from './modules/vendors/vendor.routes';
import purchaseRoutes    from './modules/purchase/purchase.routes';
import transactionRoutes from './modules/transactions/transaction.routes';
import productionRoutes  from './modules/production/production.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import reportRoutes      from './modules/reports/report.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import auditRoutes       from './modules/audit/audit.routes';
import taskRoutes        from './modules/tasks/task.routes';

const app: Application = express();

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,        // Disabled — LAN environment with React SPA
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl) in dev
      if (!origin || env.NODE_ENV === 'development') return callback(null, true);
      if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.http(message.trim()) },
    skip: (req) => req.url === '/health', // Skip health check spam
  })
);

// ── Static File Serving (Uploaded Assets) ────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
  })
);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    app: env.APP_NAME,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── API Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', rateLimiter);

// ── API Routes ────────────────────────────────────────────────────────────────
const API_V1 = '/api/v1';

app.use(`${API_V1}/auth`,          authRoutes);
app.use(`${API_V1}/users`,         userRoutes);
app.use(`${API_V1}/employees`,     employeeRoutes);
app.use(`${API_V1}/inventory`,     inventoryRoutes);
app.use(`${API_V1}/categories`,    categoryRoutes);
app.use(`${API_V1}/warehouses`,    warehouseRoutes);
app.use(`${API_V1}/vendors`,       vendorRoutes);
app.use(`${API_V1}/purchase`,      purchaseRoutes);
app.use(`${API_V1}/transactions`,  transactionRoutes);
app.use(`${API_V1}/production`,    productionRoutes);
app.use(`${API_V1}/maintenance`,   maintenanceRoutes);
app.use(`${API_V1}/reports`,       reportRoutes);
app.use(`${API_V1}/notifications`, notificationRoutes);
app.use(`${API_V1}/audit`,         auditRoutes);
app.use(`${API_V1}/tasks`,         taskRoutes);

// Legacy route without versioning (for backward compatibility)
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/employees',     employeeRoutes);
app.use('/api/inventory',     inventoryRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/warehouses',    warehouseRoutes);
app.use('/api/vendors',       vendorRoutes);
app.use('/api/purchase',      purchaseRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/production',    productionRoutes);
app.use('/api/maintenance',   maintenanceRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit',         auditRoutes);
app.use('/api/tasks',         taskRoutes);

// ── Frontend Static File Serving (Native Deployment) ─────────────────────────
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback all non-API routes to React's index.html for SPA routing
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
      hint: 'Check API documentation at /api/docs',
    });
  } else {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;