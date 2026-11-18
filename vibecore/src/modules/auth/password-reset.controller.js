import { PasswordResetService } from './password-reset.service';
import { ApiResponse } from '../../utils/api-response';

export class PasswordResetController {
  static async requestReset(req, res, next) {
    try {
      await PasswordResetService.requestReset(req.body);
      return ApiResponse.success(res, {}, 'Jika email terdaftar dan akun aktif, tautan reset akan dikirim.');
    } catch (error) { next(error); }
  }

  static async resetPassword(req, res, next) {
    try {
      await PasswordResetService.resetPassword(req.body);
      return ApiResponse.success(res, {}, 'Password berhasil diganti. Silakan login kembali.');
    } catch (error) { next(error); }
  }
}
