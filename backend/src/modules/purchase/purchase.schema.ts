/**
 * HAL OIMS — Purchase Zod Schemas
 */
import { z } from 'zod';

export const createPRSchema = z.object({
  title:          z.string().min(1),
  departmentId:   z.string().uuid().optional(),
  priority:       z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiredByDate: z.string().optional(),
  notes:          z.string().optional(),
  items:          z.array(z.object({
    itemId:           z.string().uuid(),
    vendorId:         z.string().uuid().optional(),
    requiredQuantity: z.number().positive(),
    estimatedCostInr: z.number().optional(),
    unit:             z.string().default('EACH'),
    specification:    z.string().optional(),
  })).min(1),
});

export const createPOSchema = z.object({
  purchaseRequestId: z.string().uuid().optional(),
  vendorId:          z.string().uuid(),
  expectedDate:      z.string().optional(),
  deliveryAddress:   z.string().optional(),
  paymentTerms:      z.string().optional(),
  freightCharges:    z.number().default(0),
  notes:             z.string().optional(),
  items:             z.array(z.object({
    itemId:           z.string().uuid(),
    orderedQuantity:  z.number().positive(),
    unitCostInr:      z.number().positive(),
    taxRatePercent:   z.number().default(18),
    unit:             z.string().default('EACH'),
  })).min(1),
});
