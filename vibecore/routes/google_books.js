import { Router } from 'express';
import { GoogleBooksController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/search', authenticate, authorize(['Admin', 'Librarian']), GoogleBooksController.search);
router.post('/import', authenticate, authorize(['Admin', 'Librarian']), GoogleBooksController.importBook);

export default router;
