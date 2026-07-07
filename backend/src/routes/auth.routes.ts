import { Router } from 'express';
import { signup, login, refresh, logout } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { signupSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), signup);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', validate(refreshTokenSchema), logout);

export default router;
