import { Router } from 'express';
import { ReadingController } from './reading.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateStartReading, validateFinishReading } from './reading.validator';
import { authentication } from '../../middlewares/authentication';

const router = Router();

// Public route for viewing a user's finished reads
router.get('/user/:userId/finished', ReadingController.getUserFinishedReads);
router.get('/vibe-card/:id', ReadingController.getVibeCard);

// Authenticated user routes
router.use(authentication);
router.get('/', ReadingController.getMyActivities);
router.post('/start', validateRequest(validateStartReading), ReadingController.startReading);
router.post('/finish', validateRequest(validateFinishReading), ReadingController.finishReading);
router.delete('/:id', ReadingController.deleteActivity);

export default router;
