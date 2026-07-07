import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}


export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or malformed Authorization header'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(AppError.unauthorized('Invalid or expired access token'));
  }
};
