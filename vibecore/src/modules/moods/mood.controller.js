import { MoodService } from './mood.service';
import { ApiResponse } from '../../utils/api-response';

export class MoodController {
  static async list(req, res, next) {
    try {
      const moods = await MoodService.list();
      return ApiResponse.success(res, moods, 'Daftar mood tags berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const mood = await MoodService.getById(req.params.id);
      return ApiResponse.success(res, mood, 'Detail mood tag berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const mood = await MoodService.create(req.body);
      return ApiResponse.created(res, mood, 'Mood tag berhasil dibuat.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const mood = await MoodService.update(req.params.id, req.body);
      return ApiResponse.success(res, mood, 'Mood tag berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const mood = await MoodService.delete(req.params.id);
      return ApiResponse.success(res, null, `Mood tag "${mood.name}" berhasil dihapus.`);
    } catch (err) {
      next(err);
    }
  }
}
