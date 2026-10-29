import { EditorialService } from './editorial.service';
import { ApiResponse } from '../../utils/api-response';

export class EditorialController {
  static async list(req, res, next) {
    try {
      const activeOnly = req.query.active === 'true';
      const picks = await EditorialService.list({ activeOnly });
      return ApiResponse.success(res, picks, 'Editorial picks berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const pick = await EditorialService.create(req.body);
      return ApiResponse.created(res, pick, 'Editorial pick berhasil ditambahkan.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const pick = await EditorialService.update(req.params.id, req.body);
      return ApiResponse.success(res, pick, 'Editorial pick berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await EditorialService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Editorial pick berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
