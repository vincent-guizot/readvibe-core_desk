import { Router } from 'express';
import { MemberController } from './member.controller';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin', 'Librarian']));

router.get('/', MemberController.list);
router.get('/:id', MemberController.getById);
router.patch('/:id/status', MemberController.updateStatus);
router.delete('/:id', MemberController.delete);

export default router;
