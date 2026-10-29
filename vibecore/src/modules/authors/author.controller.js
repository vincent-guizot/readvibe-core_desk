import { AuthorService } from './author.service';
import { ApiResponse } from '../../utils/api-response';

export class AuthorController {
  static async list(req, res, next) {
    try {
      const authors = await AuthorService.list();
      return ApiResponse.success(res, authors, 'Daftar penulis berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const author = await AuthorService.getById(req.params.id);
      return ApiResponse.success(res, author, 'Detail penulis berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const author = await AuthorService.create(req.body);
      return ApiResponse.created(res, author, 'Penulis berhasil ditambahkan.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const author = await AuthorService.update(req.params.id, req.body);
      return ApiResponse.success(res, author, 'Penulis berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const author = await AuthorService.delete(req.params.id);
      return ApiResponse.success(res, null, `Penulis "${author.name}" berhasil dihapus.`);
    } catch (err) {
      next(err);
    }
  }
}
