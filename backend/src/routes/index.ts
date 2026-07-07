import { Router } from 'express';
import authRoutes from './auth.routes';
import presentationRoutes from './presentation.routes';

const router = Router();

router.get('/health', (_req, res) => res.status(200).json({ success: true, message: 'OK' }));

router.use('/auth', authRoutes);
router.use('/presentations', presentationRoutes);

export default router;
