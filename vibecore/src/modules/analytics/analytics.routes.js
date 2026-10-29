import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.use(authentication);
router.use(authorization(['Admin', 'Librarian']));

router.get('/overview', AnalyticsController.getOverview);
router.get('/top-wishlisted', AnalyticsController.getTopWishlisted);
router.get('/mood-distribution', AnalyticsController.getMoodDistribution);

export default router;
