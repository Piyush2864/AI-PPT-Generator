import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, 'Logged in successfully', result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  sendSuccess(res, 200, 'Token refreshed successfully', tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw AppError.badRequest('refreshToken is required');
  await authService.logout(refreshToken);
  sendSuccess(res, 200, 'Logged out successfully');
});
