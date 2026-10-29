import { ModerationService } from './moderation.service';
import { ApiResponse } from '../../utils/api-response';

export class ModerationController {
  static async listReviews(req, res, next) {
    try {
      const items = await ModerationService.listReviews(req.query);
      return ApiResponse.success(res, items, 'Daftar ulasan moderasi berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async moderate(req, res, next) {
    try {
      const activity = await ModerationService.moderate(req.params.id, req.body);
      return ApiResponse.success(res, activity, 'Keputusan moderasi berhasil disimpan.');
    } catch (err) {
      next(err);
    }
  }
}
