import { Router } from 'express';
import { GoogleBooksClient } from './google-books.client';
import { BookMetadataMapper } from './book-metadata.mapper';
import { ApiResponse } from '../../utils/api-response';
import { authentication } from '../../middlewares/authentication';
import { authorization } from '../../middlewares/authorization';

const router = Router();

router.get('/search', authentication, authorization(['Admin', 'Librarian']), async (req, res, next) => {
  try {
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
