/**
 * HAL OIMS — Zod Request Validation Middleware
 * Phase 3: Schema-first input validation for body, params, and query
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidateTarget = 'body' | 'params' | 'query';

/**
 * Validate a specific part of the request against a Zod schema
 */
export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        received: 'received' in e ? e.received : undefined,
      }));
      console.error('Validation Error Details:', JSON.stringify(errors, null, 2));
      console.error('Request Body:', req.body);
      
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Replace request data with parsed (transformed) data
    req[target] = result.data;
    next();
  };

/** Shorthand validators */
export const validateBody   = (schema: ZodSchema) => validate(schema, 'body');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
export const validateQuery  = (schema: ZodSchema) => validate(schema, 'query');