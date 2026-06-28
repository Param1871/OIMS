/**
 * HAL OIMS — Inventory Zod Schemas
 */
import { z } from 'zod';

export const createInventorySchema = z.object({
  itemCode:         z.string().min(1).max(30),
  partNumber:       z.string().max(50).optional(),
  name:             z.string().min(1).max(255),
  description:      z.string().optional(),
  technicalSpec:    z.string().optional(),
  categoryId:       z.string().uuid(),
  subcategoryId:    z.string().uuid().optional(),
  manufacturerId:   z.string().uuid().optional(),
  vendorId:         z.string().uuid().optional(),
  countryOfOrigin:  z.string().optional(),
  unit:             z.string().default('EACH'),
  hsCode:           z.string().optional(),
  minimumStock:     z.number().min(0).default(0),
  maximumStock:     z.number().min(0).default(0),
  reorderLevel:     z.number().min(0).default(0),
  reorderQuantity:  z.number().min(0).default(0),
  purchaseCostInr:  z.number().min(0).default(0),
  sellingCostInr:   z.number().min(0).default(0),
  gstRatePercent:   z.number().min(0).max(100).default(18),
  isBatchTracked:   z.boolean().default(false),
  isSerialTracked:  z.boolean().default(false),
  isExpiryTracked:  z.boolean().default(false),
  isCalibrationRequired: z.boolean().default(false),
  isImported:       z.boolean().default(false),
  isHazardous:      z.boolean().default(false),
  isCritical:       z.boolean().default(false),
  calibrationIntervalDays: z.number().optional(),
  warrantyMonths:   z.number().optional(),
  remarks:          z.string().optional(),
});

export const updateInventorySchema = createInventorySchema.partial();

export const inventoryQuerySchema = z.object({
  search:        z.string().optional(),
  categoryId:    z.string().optional(),
  subcategoryId: z.string().optional(),
  warehouseId:   z.string().optional(),
  vendorId:      z.string().optional(),
  status:        z.string().optional(),
  lowStock:      z.coerce.boolean().optional(),
  outOfStock:    z.coerce.boolean().optional(),
  isImported:    z.coerce.boolean().optional(),
  isCritical:    z.coerce.boolean().optional(),
  page:          z.coerce.number().optional(),
  pageSize:      z.coerce.number().optional(),
  sortBy:        z.string().optional(),
  sortOrder:     z.enum(['asc', 'desc']).optional(),
}).optional();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
