import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'Registrasi berhasil.');
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login berhasil.');
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      const user = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
      };
      return ApiResponse.success(res, { user });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const profile = await AuthService.updateProfile(req.user.profileId, req.body);
      return ApiResponse.success(res, { profile }, 'Profil berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }
}
