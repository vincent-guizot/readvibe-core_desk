import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateRegister, validateLogin } from './auth.validator';
import { authentication } from '../../middlewares/authentication';

const router = Router();

router.post('/register', validateRequest(validateRegister), AuthController.register);
router.post('/login', validateRequest(validateLogin), AuthController.login);
router.get('/me', authentication, AuthController.me);
router.put('/profile', authentication, AuthController.updateProfile);

export default router;
