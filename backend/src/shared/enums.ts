/**
 * HAL OIMS — Application Enums
 * Phase 3: Mirrors Prisma enums for business logic use without circular imports
 */

// These match the Prisma schema enums exactly

export enum UserStatus {
  ACTIVE    = 'ACTIVE',
  INACTIVE  = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING   = 'PENDING',
}

export enum RoleName {
  SUPER_ADMIN            = 'SUPER_ADMIN',
  INVENTORY_MANAGER      = 'INVENTORY_MANAGER',
  STORE_KEEPER           = 'STORE_KEEPER',
  PURCHASE_DEPARTMENT    = 'PURCHASE_DEPARTMENT',
  PRODUCTION_DEPARTMENT  = 'PRODUCTION_DEPARTMENT',
  QUALITY_DEPARTMENT     = 'QUALITY_DEPARTMENT',
  MAINTENANCE_DEPARTMENT = 'MAINTENANCE_DEPARTMENT',
  FINANCE_DEPARTMENT     = 'FINANCE_DEPARTMENT',
  AUDITOR                = 'AUDITOR',
  READ_ONLY              = 'READ_ONLY',
}

export enum TransactionType {
  GOODS_IN                 = 'GOODS_IN',
  GOODS_OUT                = 'GOODS_OUT',
  STOCK_ADJUSTMENT_PLUS    = 'STOCK_ADJUSTMENT_PLUS',
  STOCK_ADJUSTMENT_MINUS   = 'STOCK_ADJUSTMENT_MINUS',
  DAMAGE                   = 'DAMAGE',
  LOST                     = 'LOST',
  SCRAP                    = 'SCRAP',
  RETURN_TO_VENDOR         = 'RETURN_TO_VENDOR',
  RETURN_FROM_PRODUCTION   = 'RETURN_FROM_PRODUCTION',
  ISSUE_TO_PRODUCTION      = 'ISSUE_TO_PRODUCTION',
  RECEIVE_FROM_GRN         = 'RECEIVE_FROM_GRN',
  TRANSFER_IN              = 'TRANSFER_IN',
  TRANSFER_OUT             = 'TRANSFER_OUT',
  OPENING_STOCK            = 'OPENING_STOCK',
}

export enum ItemStatus {
  ACTIVE        = 'ACTIVE',
  INACTIVE      = 'INACTIVE',
  DISCONTINUED  = 'DISCONTINUED',
  UNDER_REVIEW  = 'UNDER_REVIEW',
}

export enum PurchaseRequestStatus {
  DRAFT           = 'DRAFT',
  SUBMITTED       = 'SUBMITTED',
  UNDER_REVIEW    = 'UNDER_REVIEW',
  APPROVED        = 'APPROVED',
  REJECTED        = 'REJECTED',
  CANCELLED       = 'CANCELLED',
  CONVERTED_TO_PO = 'CONVERTED_TO_PO',
}

export enum PurchaseOrderStatus {
  DRAFT              = 'DRAFT',
  SENT_TO_VENDOR     = 'SENT_TO_VENDOR',
  ACKNOWLEDGED       = 'ACKNOWLEDGED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED     = 'FULLY_RECEIVED',
  CANCELLED          = 'CANCELLED',
  CLOSED             = 'CLOSED',
}

export enum GRNStatus {
  DRAFT             = 'DRAFT',
  QUALITY_PENDING   = 'QUALITY_PENDING',
  QUALITY_APPROVED  = 'QUALITY_APPROVED',
  QUALITY_REJECTED  = 'QUALITY_REJECTED',
  POSTED            = 'POSTED',
}

export enum WorkOrderStatus {
  DRAFT       = 'DRAFT',
  RELEASED    = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED   = 'COMPLETED',
  CANCELLED   = 'CANCELLED',
  ON_HOLD     = 'ON_HOLD',
}

export enum AuditAction {
  LOGIN        = 'LOGIN',
  LOGOUT       = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  CREATE       = 'CREATE',
  UPDATE       = 'UPDATE',
  DELETE       = 'DELETE',
  VIEW         = 'VIEW',
  EXPORT       = 'EXPORT',
  IMPORT       = 'IMPORT',
  TRANSFER     = 'TRANSFER',
  APPROVE      = 'APPROVE',
  REJECT       = 'REJECT',
  DOWNLOAD     = 'DOWNLOAD',
  UPLOAD       = 'UPLOAD',
  BACKUP       = 'BACKUP',
  RESTORE      = 'RESTORE',
}

export enum NotificationType {
  LOW_STOCK                = 'LOW_STOCK',
  OUT_OF_STOCK             = 'OUT_OF_STOCK',
  EXPIRY_ALERT             = 'EXPIRY_ALERT',
  CALIBRATION_DUE          = 'CALIBRATION_DUE',
  PURCHASE_APPROVAL_PENDING= 'PURCHASE_APPROVAL_PENDING',
  PURCHASE_APPROVED        = 'PURCHASE_APPROVED',
  PURCHASE_REJECTED        = 'PURCHASE_REJECTED',
  GOODS_RECEIVED           = 'GOODS_RECEIVED',
  TRANSFER_ALERT           = 'TRANSFER_ALERT',
  MAINTENANCE_DUE          = 'MAINTENANCE_DUE',
  SYSTEM_ALERT             = 'SYSTEM_ALERT',
}

export enum WarehouseType {
  MAIN       = 'MAIN',
  TRANSIT    = 'TRANSIT',
  QUARANTINE = 'QUARANTINE',
  SCRAP      = 'SCRAP',
  TOOL_CRIB  = 'TOOL_CRIB',
  BONDED     = 'BONDED',
}