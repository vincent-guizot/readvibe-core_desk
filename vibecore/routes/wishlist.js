import { Router } from 'express';
import { WishlistController } from '../controllers';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/my', authenticate, WishlistController.getMyWishlist);
router.get('/user/:userId', WishlistController.getUserPublicWishlist);
router.post('/', authenticate, WishlistController.addToWishlist);
router.put('/:id', authenticate, WishlistController.update);
router.delete('/:id', authenticate, WishlistController.delete);
router.post('/:id/move-to-reading', authenticate, WishlistController.moveToReading);

export default router;
