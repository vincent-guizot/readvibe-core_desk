import { ReadingService } from './reading.service';
import { ApiResponse } from '../../utils/api-response';

export class ReadingController {
  static async getMyActivities(req, res, next) {
    try {
      const data = await ReadingService.getMyActivities(req.user.id, req.query.status);
      return ApiResponse.success(res, data, 'Aktivitas membaca berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getUserFinishedReads(req, res, next) {
    try {
      const result = await ReadingService.getUserFinishedReads(req.params.userId);
      return ApiResponse.success(res, result, 'Buku selesai dibaca berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async startReading(req, res, next) {
    try {
      const activity = await ReadingService.startReading(req.user.id, req.body);
      return ApiResponse.created(res, activity, 'Buku berhasil ditambahkan ke rak sedang dibaca.');
    } catch (err) {
      next(err);
    }
  }

  static async finishReading(req, res, next) {
    try {
      const activity = await ReadingService.finishReading(req.user.id, req.body);
      return ApiResponse.success(res, activity, 'Selamat! Buku berhasil ditandai selesai dibaca.');
    } catch (err) {
      next(err);
    }
  }

  static async getVibeCard(req, res, next) {
    try {
      const card = await ReadingService.getVibeCard(req.params.id, req.user ? req.user.id : null);
      return ApiResponse.success(res, card, 'Data Vibe Card berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteActivity(req, res, next) {
    try {
      await ReadingService.deleteActivity(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Aktivitas membaca berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
