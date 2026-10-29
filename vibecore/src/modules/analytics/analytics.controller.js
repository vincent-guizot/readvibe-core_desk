import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/api-response';

export class AnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const data = await AnalyticsService.getOverview();
      return ApiResponse.success(res, data, 'Ringkasan analitik berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getTopWishlisted(req, res, next) {
    try {
      const limit = req.query.limit || 5;
      const data = await AnalyticsService.getTopWishlisted(limit);
      return ApiResponse.success(res, data, 'Tren buku wishlist berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getMoodDistribution(req, res, next) {
    try {
      const data = await AnalyticsService.getMoodDistribution();
      return ApiResponse.success(res, data, 'Distribusi tren mood berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }
}
