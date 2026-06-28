/**
 * HAL OIMS — Warehouse Zod Schemas
 */
import { z } from 'zod';

export const createWarehouseSchema = z.object({
  code:       z.string().min(1).max(20),
  name:       z.string().min(1).max(150),
  type:       z.string().default('MAIN'),
  address:    z.string().optional(),
  city:       z.string().optional(),
  state:      z.string().optional(),
  pincode:    z.string().optional(),
  totalArea:  z.number().optional(),
});

export const transferStockSchema = z.object({
  itemId:          z.string().uuid(),
  fromWarehouseId: z.string().uuid(),
  toWarehouseId:   z.string().uuid(),
  quantity:        z.number().positive(),
  reason:          z.string().optional(),
});
