import { Router } from 'express';
import { ReviewController } from './review.controller';
import { validateRequest } from '../../middlewares/validate-request';
import { validateReviewPayload } from './review.validator';
import { authentication } from '../../middlewares/authentication';

const router = Router();

// Public: view reviews for a book
router.get('/book/:bookId', ReviewController.getBookReviews);

// Protected: submit review & report
router.post('/', authentication, validateRequest(validateReviewPayload), ReviewController.submitReview);
router.post('/:id/report', authentication, ReviewController.reportReview);

export default router;
