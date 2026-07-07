import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('errorHandler');


export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, path: req.path, details: err.details }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
