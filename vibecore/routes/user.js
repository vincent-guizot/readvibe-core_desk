import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize(['Admin', 'Librarian']), UserController.getAllUsers);
router.get('/:id', authenticate, UserController.findById);
router.put('/:id/role', authenticate, authorize(['Admin']), UserController.updateUserRole);
router.delete('/:id', authenticate, authorize(['Admin']), UserController.delete);

export default router;
