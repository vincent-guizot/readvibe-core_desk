import { SettingsService } from './settings.service';
import { ApiResponse } from '../../utils/api-response';

export class SettingsController {
  static getSettings(req, res, next) {
    try {
      const data = SettingsService.getSettings();
      return ApiResponse.success(res, data, 'Pengaturan sistem berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static updateSettings(req, res, next) {
    try {
      const data = SettingsService.updateSettings(req.body);
      return ApiResponse.success(res, data, 'Pengaturan sistem berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }
}
