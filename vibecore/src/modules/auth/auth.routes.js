import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword, validateProfile, validateAccountPassword, validatePasswordChange, validateEmailChange } from './auth.validator';
import { PasswordResetController } from './password-reset.controller';
import { passwordResetRateLimit } from '../../middlewares/password-reset-rate-limit';
import { authentication } from '../../middlewares/authentication';

const router = Router();

router.post('/register', validateRequest(validateRegister), AuthController.register);
router.post('/login', validateRequest(validateLogin), AuthController.login);
router.post('/forgot-password', passwordResetRateLimit(), validateRequest(validateForgotPassword), PasswordResetController.requestReset);
router.post('/reset-password', passwordResetRateLimit(), validateRequest(validateResetPassword), PasswordResetController.resetPassword);
router.get('/me', authentication, AuthController.me);
router.put('/profile', authentication, validateRequest(validateProfile), AuthController.updateProfile);
router.get('/public/:username', AuthController.publicProfile);
router.put('/password', authentication, validateRequest(validatePasswordChange), AuthController.changePassword);
router.patch('/account', authentication, validateRequest(validateEmailChange), AuthController.changeEmail);
router.delete('/account', authentication, validateRequest(validateAccountPassword), AuthController.deleteAccount);

export default router;
