import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';
import { validateRequest } from '../../middlewares/validate-request';
import { validateSettingsPayload, validateSettingsPreview } from './settings.validator';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin'])); // Admin only

router.get('/', SettingsController.getSettings);
router.get('/health', SettingsController.health);
router.post('/preview', validateRequest(validateSettingsPreview), SettingsController.preview);
router.put('/', validateRequest(validateSettingsPayload), SettingsController.updateSettings);

export default router;
