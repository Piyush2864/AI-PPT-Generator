import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/User.validator';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validate(updateProfileSchema), updateProfile);
router.patch('/me/password', validate(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount); 

export default router;