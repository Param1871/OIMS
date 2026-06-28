/**
 * HAL OIMS — User Zod Schemas
 */
import { z } from 'zod';

export const createUserSchema = z.object({
  username:    z.string().min(3).max(50),
  email:       z.string().email(),
  password:    z.string().min(8),
  firstName:   z.string().min(1).max(100),
  lastName:    z.string().min(1).max(100),
  phone:       z.string().optional(),
  roleId:      z.string().uuid(),
  employeeCode: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName:  z.string().min(1).max(100).optional(),
  phone:     z.string().optional(),
});

export type CreateUserInput   = z.infer<typeof createUserSchema>;
export type UpdateUserInput   = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
