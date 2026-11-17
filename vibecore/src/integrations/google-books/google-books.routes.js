import { Router } from 'express';
import { GoogleBooksClient } from './google-books.client';
import { BookMetadataMapper } from './book-metadata.mapper';
import { ApiResponse } from '../../utils/api-response';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';
import { SettingsService } from '../../modules/settings/settings.service';
import { AppError } from '../../errors/app-error';

const router = Router();

router.get('/search', authentication, authorization(['Admin', 'Librarian']), async (req, res, next) => {
  try {
    if (!(await SettingsService.getSettings()).googleBooksEnabled) throw AppError.forbidden('Import Google Books dinonaktifkan oleh administrator.');
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (query.length < 2) {
      return ApiResponse.error(res, 'Kata kunci pencarian minimal dua karakter.', 400, 'VALIDATION_ERROR');
    }
    const volumes = await GoogleBooksClient.searchVolumes(query);
    const results = volumes.map(BookMetadataMapper.toDomain);
    return ApiResponse.success(res, results, 'Hasil pencarian Google Books');
  } catch (err) {
    next(err);
  }
});

export default router;
