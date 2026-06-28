/**
 * HAL OIMS — Shared TypeScript Types
 * Phase 3: Common interfaces used across the application
 */

import { Request } from 'express';

// ── Authenticated Request (after JWT middleware) ────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: {
    userId:   string;
    username: string;
    email:    string;
    roleId:   string;
    roleName: string;
    status:   string;
  };
}

// ── JWT Payload ───────────────────────────────────────────────────────────────
export interface JWTPayload {
  userId:   string;
  username: string;
  email:    string;
  roleId:   string;
  roleName: string;
  iat?:     number;
  exp?:     number;
}

// ── Refresh Token Payload ─────────────────────────────────────────────────────
export interface RefreshTokenPayload {
  userId:    string;
  tokenId:   string;
  iat?:      number;
  exp?:      number;
}

// ── Query Filter base ─────────────────────────────────────────────────────────
export interface BaseFilter {
  search?:   string;
  page?:     number;
  pageSize?: number;
  sortBy?:   string;
  sortOrder?: 'asc' | 'desc';
  isActive?:  boolean;
}

// ── Inventory filters ─────────────────────────────────────────────────────────
export interface InventoryFilter extends BaseFilter {
  categoryId?:    string;
  subcategoryId?: string;
  warehouseId?:   string;
  vendorId?:      string;
  manufacturerId?:string;
  status?:        string;
  lowStock?:      boolean;
  outOfStock?:    boolean;
  isImported?:    boolean;
  isCritical?:    boolean;
}

// ── Purchase filters ──────────────────────────────────────────────────────────
export interface PurchaseFilter extends BaseFilter {
  status?:   string;
  vendorId?: string;
  fromDate?: string;
  toDate?:   string;
  priority?: string;
}

// ── Transaction filters ───────────────────────────────────────────────────────
export interface TransactionFilter extends BaseFilter {
  itemId?:      string;
  type?:        string;
  warehouseId?: string;
  fromDate?:    string;
  toDate?:      string;
  userId?:      string;
}

// ── Audit filter ──────────────────────────────────────────────────────────────
export interface AuditFilter extends BaseFilter {
  userId?:     string;
  action?:     string;
  module?:     string;
  entityType?: string;
  fromDate?:   string;
  toDate?:     string;
}

// ── File upload info ──────────────────────────────────────────────────────────
export interface UploadedFile {
  fieldname:  string;
  originalname: string;
  mimetype:   string;
  size:       number;
  path:       string;
  filename:   string;
}

// ── Stock movement event ──────────────────────────────────────────────────────
export interface StockMovementEvent {
  itemId:          string;
  itemCode:        string;
  itemName:        string;
  transactionType: string;
  quantity:        number;
  newQuantity:     number;
  warehouseId?:    string;
  performedBy:     string;
  timestamp:       string;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalItems:           number;
  totalStockValueInr:   number;
  lowStockItems:        number;
  outOfStockItems:      number;
  pendingPurchaseOrders:number;
  todayTransactions:    number;
  activeVendors:        number;
  activeEmployees:      number;
  totalWarehouses:      number;
  monthlyConsumption:   number;
}