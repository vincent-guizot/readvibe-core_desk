import { Router } from 'express';
import { BookController } from './book.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateBookPayload } from './book.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

// Public routes
router.get('/', BookController.list);
router.get('/:id', BookController.getById);

// Staff-protected routes (Admin, Librarian)
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateBookPayload), BookController.create);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), BookController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), BookController.delete);

export default router;
