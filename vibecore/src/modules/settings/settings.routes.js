import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin'])); // Admin only

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;
