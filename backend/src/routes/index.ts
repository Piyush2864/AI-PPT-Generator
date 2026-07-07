import { Router } from 'express';
import authRoutes from './auth.routes';
import presentationRoutes from './presentation.routes';
import userRoutes from './auth.routes'

const router = Router();

router.get('/health', (_req, res) => res.status(200).json({ success: true, message: 'OK' }));

router.use('/auth', authRoutes);
router.use('/presentations', presentationRoutes);
router.use('/users', userRoutes);

export default router;
