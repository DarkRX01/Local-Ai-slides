import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, `Validation error: ${error.issues.map((e: any) => e.message).join(', ')}`));
      } else {
        next(error);
      }
    }
  };
}
