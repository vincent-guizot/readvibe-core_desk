import { Router } from 'express';
import { StaffController } from './staff.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateStaffPayload } from './staff.validator';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin'])); // Admin only

router.get('/', StaffController.list);
router.post('/', validateRequest(validateStaffPayload), StaffController.create);
router.patch('/:id/role', StaffController.updateRole);
router.delete('/:id', StaffController.delete);

export default router;
