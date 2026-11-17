import { Router } from 'express';
import { BookController } from './book.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateBookPayload, validateBookUpdatePayload } from './book.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';
import { BookCoverController } from './book-cover.controller';
import { validateCoverUpload } from './book-cover.validator';

const router = Router();

// Public routes
router.get('/', BookController.list);
router.get('/covers/:filename', BookCoverController.get);
router.get('/:id', BookController.getById);

// Staff-protected routes (Admin, Librarian)
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateBookPayload), BookController.create);
router.post('/covers', authentication, authorization(['Admin', 'Librarian']), validateCoverUpload, BookCoverController.upload);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateBookUpdatePayload), BookController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), BookController.delete);

export default router;
