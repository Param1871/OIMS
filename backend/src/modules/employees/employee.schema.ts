/**
 * HAL OIMS — Employee Zod Schemas
 */
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeCode:  z.string().min(1),
  userId:        z.string().uuid(),
  departmentId:  z.string().uuid(),
  designationId: z.string().uuid(),
  firstName:     z.string().min(1),
  lastName:      z.string().min(1),
  email:         z.string().email(),
  phone:         z.string().optional(),
  dateOfJoining: z.coerce.date(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
