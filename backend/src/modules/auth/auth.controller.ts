/**
 * HAL OIMS — Auth Controller
 * Phase 3: HTTP handlers for authentication endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { getClientIP } from '../../shared/helpers';

export const authController = {
  /** POST /api/auth/login */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const ip = getClientIP(req as any);
      const result = await authService.login(username, password, ip);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  },

  /** POST /api/auth/logout */
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ip = getClientIP(req as any);
      await authService.logout(req.user!.userId, ip);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  },

  /** POST /api/auth/refresh */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token required' });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) { next(err); }
  },

  /** PUT /api/auth/change-password */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (err) { next(err); }
  },

  /** GET /api/auth/me */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },
};
