import { Router } from 'express';
import { ModerationController } from './moderation.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateModerationDecision } from './moderation.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin', 'Librarian']));

router.get('/reviews', ModerationController.listReviews);
router.patch('/reviews/:id', validateRequest(validateModerationDecision), ModerationController.moderate);

export default router;
