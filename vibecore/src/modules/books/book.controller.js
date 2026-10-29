import { BookService } from './book.service';
import { ApiResponse } from '../../utils/api-response';

export class BookController {
  static async list(req, res, next) {
    try {
      const { search, genreId, authorId, mood, page = 1, limit = 20 } = req.query;
      const { books, meta } = await BookService.list({
        search,
        genreId,
        authorId,
        mood,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return ApiResponse.paginated(res, books, meta, 'Katalog buku berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const book = await BookService.getById(req.params.id);
      return ApiResponse.success(res, book, 'Detail buku berhasil dimuat.');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const book = await BookService.create(req.body, req.user ? req.user.id : null);
      return ApiResponse.created(res, book, 'Buku berhasil ditambahkan.');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const book = await BookService.update(req.params.id, req.body);
      return ApiResponse.success(res, book, 'Buku berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const book = await BookService.delete(req.params.id);
      return ApiResponse.success(res, null, `Buku "${book.title}" berhasil dihapus.`);
    } catch (err) {
      next(err);
    }
  }
}
