import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { slideService } from '../services/slide.service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const updateSlide = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, slideId } = req.params;
  const slide = await slideService.updateSlide(id, slideId, req.user!.userId, req.body);
  sendSuccess(res, 200, 'Slide updated successfully', slide);
});

export const reorderSlides = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const slides = await slideService.reorderSlides(id, req.user!.userId, req.body);
  sendSuccess(res, 200, 'Slides reordered successfully', slides);
});