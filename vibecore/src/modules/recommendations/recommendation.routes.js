import { Router } from 'express';
import { RecommendationController } from './recommendation.controller';
import { EditorialController } from '../editorial/editorial.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateRecommendationQuery } from './recommendation.validator';

const router = Router();

// Match vibe endpoint
router.post('/match', validateRequest(validateRecommendationQuery), RecommendationController.matchVibe);

// Alias root POST
router.post('/', validateRequest(validateRecommendationQuery), RecommendationController.matchVibe);

// Editorial recommendations
router.get('/editorial', EditorialController.list);

export default router;
