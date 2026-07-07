import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { generationRateLimiter } from '../middlewares/rateLimiter.middleware';
import {
  createPresentationSchema,
  presentationIdParamSchema,
  listPresentationsQuerySchema,
} from '../validators/presentation.validator';
import { updateSlideSchema, reorderSlidesSchema } from '../validators/slide.validator';
import {
  createPresentation,
  listPresentations,
  getPresentation,
  deletePresentation,
  getJobLogs,
  exportPresentation,
  downloadPdf,
  regeneratePresentation,
  duplicatePresentation,
} from '../controllers/presentation.controller';
import { updateSlide, reorderSlides } from '../controllers/slide.controller';

const router = Router();

router.use(authenticate);


router.post('/', generationRateLimiter, validate(createPresentationSchema), createPresentation);
router.get('/', validate(listPresentationsQuerySchema), listPresentations);
router.get('/:id', validate(presentationIdParamSchema), getPresentation);
router.delete('/:id', validate(presentationIdParamSchema), deletePresentation);


router.get('/:id/logs', validate(presentationIdParamSchema), getJobLogs);
router.post('/:id/regenerate', validate(presentationIdParamSchema), regeneratePresentation);
router.post('/:id/duplicate', validate(presentationIdParamSchema), duplicatePresentation);
router.post('/:id/export', validate(presentationIdParamSchema), exportPresentation);
router.get('/:id/download', validate(presentationIdParamSchema), downloadPdf);


router.patch('/:id/slides/reorder', validate(reorderSlidesSchema), reorderSlides);
router.patch('/:id/slides/:slideId', validate(updateSlideSchema), updateSlide);

export default router;
