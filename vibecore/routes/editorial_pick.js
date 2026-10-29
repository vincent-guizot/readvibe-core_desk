import { Router } from 'express';
import { EditorialPickController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', EditorialPickController.getAll);
router.post('/', authenticate, authorize(['Admin', 'Librarian']), EditorialPickController.create);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), EditorialPickController.update);
router.delete('/:id', authenticate, authorize(['Admin', 'Librarian']), EditorialPickController.delete);

export default router;
