import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateWishlistPayload } from './wishlist.validator';
import { authentication } from '../../middlewares/authentication';

const router = Router();

// Public route to view a user's public wishlist
router.get('/user/:userId', WishlistController.getUserPublicWishlist);

// Authenticated user wishlist
router.use(authentication);
router.get('/', WishlistController.getMyWishlist);
router.post('/', validateRequest(validateWishlistPayload), WishlistController.add);
router.put('/:id', WishlistController.update);
router.delete('/:id', WishlistController.remove);

export default router;
