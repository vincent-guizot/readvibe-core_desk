import { SettingsService } from './settings.service';
import { ApiResponse } from '../../utils/api-response';

export class SettingsController {
  static async health(req, res, next) {
    try { return ApiResponse.success(res, await SettingsService.health()); } catch (error) { next(error); }
  }
  static async preview(req, res, next) {
    try { return ApiResponse.success(res, await SettingsService.preview(req.body)); } catch (error) { next(error); }
  }
  static async getSettings(req, res, next) {
    try {
      const data = await SettingsService.getSettings();
      return ApiResponse.success(res, data, 'Pengaturan sistem berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const data = await SettingsService.updateSettings(req.body, req.user.id);
      return ApiResponse.success(res, data, 'Pengaturan sistem berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }
}
