import { Router } from 'express';
import { EditorialController } from './editorial.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateEditorialPayload } from './editorial.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

// Public: view editorial picks
router.get('/', EditorialController.list);

// Staff only: manage editorial picks
router.post('/', authentication, authorization(['Admin', 'Librarian']), validateRequest(validateEditorialPayload), EditorialController.create);
router.put('/:id', authentication, authorization(['Admin', 'Librarian']), EditorialController.update);
router.delete('/:id', authentication, authorization(['Admin', 'Librarian']), EditorialController.delete);

export default router;
