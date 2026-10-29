import { Router } from 'express';
import { ReadingActivityController } from '../controllers';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/my', authenticate, ReadingActivityController.getMyActivities);
router.get('/user/:userId/finished', ReadingActivityController.getUserFinishedReads);
router.post('/transition', authenticate, ReadingActivityController.transitionStatus);
router.post('/finish-and-review', authenticate, ReadingActivityController.finishAndReview);
router.post('/:id/flag', authenticate, ReadingActivityController.flagReview);

export default router;
