import { Router } from 'express';
import { RecommendationController } from './recommendation.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateRecommendationQuery } from './recommendation.validator';

const router = Router();

// Match vibe endpoint
router.post('/match', validateRequest(validateRecommendationQuery), RecommendationController.matchVibe);

// Alias root POST
router.post('/', validateRequest(validateRecommendationQuery), RecommendationController.matchVibe);

export default router;
