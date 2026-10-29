import { Router } from 'express';
import { MoodController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', MoodController.getAllMoods);
router.get('/:id', MoodController.findById);
router.post('/', authenticate, authorize(['Admin', 'Librarian']), MoodController.create);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), MoodController.update);
router.delete('/:id', authenticate, authorize(['Admin', 'Librarian']), MoodController.delete);
router.post('/assign', authenticate, authorize(['Admin', 'Librarian']), MoodController.assignMoodToBook);

export default router;
