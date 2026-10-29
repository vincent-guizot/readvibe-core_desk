import { Router } from 'express';
import { BookController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.findById);
router.post('/', authenticate, authorize(['Admin', 'Librarian']), BookController.create);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), BookController.update);
router.delete('/:id', authenticate, authorize(['Admin', 'Librarian']), BookController.delete);

export default router;
