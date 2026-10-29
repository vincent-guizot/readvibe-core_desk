import { StaffService } from './staff.service';
import { ApiResponse } from '../../utils/api-response';

export class StaffController {
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

  static async updateRole(req, res, next) {
    try {
      const staff = await StaffService.updateRole(req.params.id, req.body.role);
      return ApiResponse.success(res, staff, 'Peran staf berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await StaffService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Akun staf berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
