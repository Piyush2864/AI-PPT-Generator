import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { generationRateLimiter } from '../middlewares/rateLimiter.middleware';
import {
  createPresentationSchema,
  presentationIdParamSchema,
  listPresentationsQuerySchema,
} from '../validators/presentation.validator';
import {
  createPresentation,
  listPresentations,
  getPresentation,
  deletePresentation,
  getJobLogs,
  exportPresentation,
  downloadPdf,
} from '../controllers/presentation.controller';

const router = Router();

router.use(authenticate); 

router.post('/', generationRateLimiter, validate(createPresentationSchema), createPresentation);
router.get('/', validate(listPresentationsQuerySchema), listPresentations);
router.get('/:id', validate(presentationIdParamSchema), getPresentation);
router.delete('/:id', validate(presentationIdParamSchema), deletePresentation);
router.get('/:id/logs', validate(presentationIdParamSchema), getJobLogs);
router.post('/:id/export', validate(presentationIdParamSchema), exportPresentation);
router.get('/:id/download', validate(presentationIdParamSchema), downloadPdf);

export default router;
