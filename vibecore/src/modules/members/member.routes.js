import { Router } from 'express';
import { MemberController } from './member.controller';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';
import { validateRequest } from '../../middlewares/validate-request';
import { validateMemberStatus } from './member.validator';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin']));

router.get('/', MemberController.list);
router.get('/:id', MemberController.getById);
router.patch('/:id/status', validateRequest(validateMemberStatus), MemberController.updateStatus);
router.put('/:id/status', validateRequest(validateMemberStatus), MemberController.updateStatus);
router.delete('/:id', MemberController.delete);

export default router;
