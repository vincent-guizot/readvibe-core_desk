import { CategoryService } from './category.service';
import { ApiResponse } from '../../utils/api-response';

export class CategoryController {
  static async list(req, res, next) {
    try {
      const categories = await CategoryService.list();
      return ApiResponse.success(res, categories, 'Daftar kategori berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const category = await CategoryService.getById(req.params.id);
      return ApiResponse.success(res, category, 'Detail kategori berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const category = await CategoryService.create(req.body);
      return ApiResponse.created(res, category, 'Kategori berhasil dibuat.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const category = await CategoryService.update(req.params.id, req.body);
      return ApiResponse.success(res, category, 'Kategori berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const category = await CategoryService.delete(req.params.id);
      return ApiResponse.success(res, null, `Kategori "${category.name}" berhasil dihapus.`);
    } catch (err) {
      next(err);
    }
  }
}
