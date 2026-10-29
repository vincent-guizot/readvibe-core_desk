import { Router } from 'express';
import { ModerationController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/reviews', authenticate, authorize(['Admin', 'Librarian']), ModerationController.getFlaggedReviews);
router.put('/reviews/:id', authenticate, authorize(['Admin', 'Librarian']), ModerationController.updateModerationStatus);

export default router;
