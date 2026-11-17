import { Router } from 'express';
import { CategoryController } from './category.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateCategoryPayload, validateCategoryUpdatePayload } from './category.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

// Public: view categories
router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);

// Staff only: manage categories
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateCategoryPayload), CategoryController.create);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateCategoryUpdatePayload), CategoryController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), CategoryController.delete);

export default router;
