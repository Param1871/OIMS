/**
 * HAL OIMS — Pagination Helper
 * Phase 3: Standardized pagination for all list endpoints
 */

import { Request } from 'express';
import { CONSTANTS } from '../config/constants';
import { PaginationMeta } from './response';

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Parse pagination params from query string
 */
export const parsePagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || CONSTANTS.DEFAULT_PAGE);
  const pageSize = Math.min(
    CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.pageSize as string) || CONSTANTS.DEFAULT_PAGE_SIZE)
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

/**
 * Parse sort params from query string
 */
export const parseSort = (
  req: Request,
  defaultField = 'createdAt',
  allowedFields: string[] = []
): SortParams => {
  const field = req.query.sortBy as string || defaultField;
  const order = (req.query.sortOrder as string || 'desc').toLowerCase() as 'asc' | 'desc';

  return {
    field: allowedFields.length === 0 || allowedFields.includes(field) ? field : defaultField,
    order: ['asc', 'desc'].includes(order) ? order : 'desc',
  };
};

/**
 * Build pagination metadata for response
 */
export const buildMeta = (
  total: number,
  params: PaginationParams
): PaginationMeta => ({
  total,
  page: params.page,
  pageSize: params.pageSize,
  totalPages: Math.ceil(total / params.pageSize),
  hasNext: params.page * params.pageSize < total,
  hasPrev: params.page > 1,
});