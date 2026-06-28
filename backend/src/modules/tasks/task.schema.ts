import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
});

export const addTaskMessageSchema = z.object({
  content: z.string().min(1),
});
