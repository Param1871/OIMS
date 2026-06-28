/**
 * HAL OIMS — Transaction Zod Schemas
 */
import { z } from 'zod';

export const createTransactionSchema = z.object({
  type:             z.string().min(1),
  itemId:           z.string().uuid(),
  quantity:         z.number().positive(),
  fromWarehouseId:  z.string().uuid().optional(),
  toWarehouseId:    z.string().uuid().optional(),
  fromBinId:        z.string().uuid().optional(),
  toBinId:          z.string().uuid().optional(),
  unitCostInr:      z.number().optional(),
  batchNumber:      z.string().optional(),
  serialNumber:     z.string().optional(),
  referenceType:    z.string().optional(),
  referenceId:      z.string().optional(),
  reason:           z.string().optional(),
  remarks:          z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
