import { Router } from 'express';
import { MoodController } from './mood.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateMoodPayload } from './mood.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

// Public: view moods
router.get('/', MoodController.list);
router.get('/:id', MoodController.getById);

// Staff only: manage moods
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateMoodPayload), MoodController.create);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), MoodController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), MoodController.delete);

export default router;
