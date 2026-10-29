import { ReviewService } from './review.service';
import { ApiResponse } from '../../utils/api-response';

export class ReviewController {
  static async getBookReviews(req, res, next) {
    try {
      const data = await ReviewService.getBookReviews(req.params.bookId);
      return ApiResponse.success(res, data, 'Ulasan buku berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async submitReview(req, res, next) {
    try {
      const review = await ReviewService.submitReview(req.user.id, req.body);
      return ApiResponse.created(res, review, 'Ulasan berhasil dikirim.');
    } catch (err) {
      next(err);
    }
  }

  static async reportReview(req, res, next) {
    try {
      await ReviewService.reportReview(req.params.id, req.body);
      return ApiResponse.success(res, null, 'Ulasan telah dilaporkan untuk ditinjau oleh tim moderasi.');
    } catch (err) {
      next(err);
    }
  }
}
