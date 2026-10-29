import { MemberService } from './member.service';
import { ApiResponse } from '../../utils/api-response';

export class MemberController {
  static async list(req, res, next) {
    try {
      const { search, role, page = 1, limit = 20 } = req.query;
      const { members, meta } = await MemberService.list({ search, role, page, limit });
      return ApiResponse.paginated(res, members, meta, 'Daftar member berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const member = await MemberService.getById(req.params.id);
      return ApiResponse.success(res, member, 'Detail member berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const member = await MemberService.updateStatus(req.params.id, req.body.status);
      return ApiResponse.success(res, member, 'Status member berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await MemberService.delete(req.params.id);
      return ApiResponse.success(res, null, 'Member berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
