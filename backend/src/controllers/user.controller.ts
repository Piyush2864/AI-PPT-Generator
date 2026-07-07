import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { userService } from '../services/user.service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await userService.getProfile(req.user!.userId);
  sendSuccess(res, 200, 'Profile fetched successfully', profile);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await userService.updateProfile(req.user!.userId, req.body);
  sendSuccess(res, 200, 'Profile updated successfully', profile);
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await userService.changePassword(req.user!.userId, req.body);
  sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
});

export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { password } = req.body;
  if (!password) throw AppError.badRequest('Password is required to delete account');
  await userService.deleteAccount(req.user!.userId, password);
  sendSuccess(res, 200, 'Account deleted successfully');
});