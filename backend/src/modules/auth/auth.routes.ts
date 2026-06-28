/**
 * HAL OIMS — Auth Routes
 * Phase 3: Authentication endpoint routing
 */
import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import {
  loginSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

// Public routes (no auth required)
router.post('/login',    authRateLimiter, validateBody(loginSchema),   authController.login);
router.post('/refresh',                                                  authController.refresh);

// Protected routes
router.post('/logout',          authenticate, authController.logout);
router.get('/me',               authenticate, authController.getMe);
router.put('/change-password',  authenticate, validateBody(changePasswordSchema), authController.changePassword);

export default router;
