import { Router } from 'express';
import { GenreController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', GenreController.getAllGenres);
router.get('/:id', GenreController.findById);
router.post('/', authenticate, authorize(['Admin', 'Librarian']), GenreController.create);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), GenreController.update);
router.delete('/:id', authenticate, authorize(['Admin', 'Librarian']), GenreController.delete);

export default router;
