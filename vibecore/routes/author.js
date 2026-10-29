import { Router } from 'express';
import { AuthorController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', AuthorController.getAllAuthors);
router.get('/:id', AuthorController.findById);
router.get('/:id/books', AuthorController.bookList);
router.post('/', authenticate, authorize(['Admin', 'Librarian']), AuthorController.create);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), AuthorController.update);
router.delete('/:id', authenticate, authorize(['Admin', 'Librarian']), AuthorController.delete);

export default router;
