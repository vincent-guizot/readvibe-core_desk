import { BookCoverService } from './book-cover.service';
import { ApiResponse } from '../../utils/api-response';
import { AppError } from '../../errors/app-error';

export class BookCoverController {
  static async upload(req, res, next) {
    try {
      const cover = await BookCoverService.store(req.file);
      return ApiResponse.created(res, cover, 'Cover berhasil diunggah.');
    } catch (error) {
      return next(error);
    }
  }

  static get(req, res, next) {
    try {
      const filename = BookCoverService.resolvePath(req.params.filename);
      res.set('X-Content-Type-Options', 'nosniff');
      return res.sendFile(filename, { maxAge: '1y', immutable: true }, (error) => {
        if (!error) return;
        if (res.headersSent) return next(error);
        return next(error.status === 404 || error.code === 'ENOENT' ? AppError.notFound('Cover tidak ditemukan.') : error);
      });
    } catch (error) {
      return next(error);
    }
  }
}
