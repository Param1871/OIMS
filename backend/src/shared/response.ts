/**
 * HAL OIMS — Standard API Response Wrapper
 * Phase 3: Consistent response shape across all endpoints
 */

import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Send a success response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

// Send a created (201) response
export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response => sendSuccess(res, data, message, 201);

// Send an error response
export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

// Shorthand for 401 Unauthorized
export const sendUnauthorized = (
  res: Response,
  message = 'Authentication required'
): Response => sendError(res, message, 401);

// Shorthand for 403 Forbidden
export const sendForbidden = (
  res: Response,
  message = 'Access denied. Insufficient permissions.'
): Response => sendError(res, message, 403);

// Shorthand for 404 Not Found
export const sendNotFound = (
  res: Response,
  entity = 'Resource'
): Response => sendError(res, `${entity} not found`, 404);

// Shorthand for 409 Conflict
export const sendConflict = (
  res: Response,
  message = 'Resource already exists'
): Response => sendError(res, message, 409);

// Shorthand for 500 Internal Server Error
export const sendServerError = (
  res: Response,
  message = 'Internal server error'
): Response => sendError(res, message, 500);