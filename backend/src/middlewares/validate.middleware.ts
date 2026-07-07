import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';


export const validate = (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'), 
          message: e.message,
        }));
        return next(AppError.badRequest('Validation failed', details));
      }
      next(err);
    }
  };
