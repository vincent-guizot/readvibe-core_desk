import { Router } from 'express';
import { AnalyticsController } from '../controllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/user/stats', authenticate, AnalyticsController.getUserReadingStats);
router.get('/dashboard', authenticate, authorize(['Admin', 'Librarian']), AnalyticsController.getDashboardKPI);
router.get('/wishlist-intelligence', authenticate, authorize(['Admin', 'Librarian']), AnalyticsController.getWishlistIntelligence);
router.get('/reading-trends', authenticate, authorize(['Admin', 'Librarian']), AnalyticsController.getReadingTrends);

export default router;
