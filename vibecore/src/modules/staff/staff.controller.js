import { StaffService } from './staff.service';
import { ApiResponse } from '../../utils/api-response';

export class StaffController {
  static async getById(req, res, next) {
    try { return ApiResponse.success(res, await StaffService.getById(req.params.id)); } catch (error) { next(error); }
  }
  static async list(req, res, next) {
    try {
      const staff = await StaffService.list();
      return ApiResponse.success(res, staff, 'Daftar staf berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const staff = await StaffService.create(req.body);
      return ApiResponse.created(res, staff, 'Akun staf berhasil dibuat.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const staff = await StaffService.update(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, staff, 'Peran staf berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await StaffService.delete(req.params.id, req.user.id);
      return ApiResponse.success(res, null, 'Akun staf berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
