import { Router } from 'express';
import { AuthorController } from './author.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateAuthorPayload } from './author.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

// Public: view authors
router.get('/', AuthorController.list);
router.get('/:id', AuthorController.getById);

// Staff only: manage authors
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateAuthorPayload), AuthorController.create);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), AuthorController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), AuthorController.delete);

export default router;
