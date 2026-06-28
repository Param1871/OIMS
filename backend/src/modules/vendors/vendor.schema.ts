/**
 * HAL OIMS — Vendor Zod Schemas
 */
import { z } from 'zod';

export const createVendorSchema = z.object({
  vendorCode:       z.string().min(1).max(20),
  name:             z.string().min(1).max(200),
  gstNumber:        z.string().max(20).optional(),
  panNumber:        z.string().max(15).optional(),
  address:          z.string().optional(),
  city:             z.string().optional(),
  state:            z.string().optional(),
  pincode:          z.string().optional(),
  phone:            z.string().optional(),
  email:            z.string().email().optional().or(z.literal('')),
  paymentTerms:     z.string().optional(),
  creditLimitInr:   z.number().optional(),
  isApprovedVendor: z.boolean().default(false),
});

export const updateVendorSchema = createVendorSchema.partial();
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
