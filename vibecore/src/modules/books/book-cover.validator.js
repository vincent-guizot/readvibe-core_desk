import multer from 'multer';
import { AppError } from '../../errors/app-error';

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const receiveCover = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COVER_BYTES, files: 1, fields: 0, parts: 1 },
  fileFilter(req, file, next) {
    if (!COVER_MIME_TYPES.includes(file.mimetype)) return next(AppError.badRequest('Cover harus berupa JPG, PNG, atau WEBP.', 'INVALID_COVER_TYPE'));
    return next(null, true);
  },
}).single('cover');

export function validateCoverUpload(req, res, next) {
  receiveCover(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        return next(new AppError(tooLarge ? 'Ukuran cover maksimal 5 MB.' : 'Kirim tepat satu file dengan field cover, tanpa field tambahan.', tooLarge ? 413 : 400, 'INVALID_COVER_UPLOAD'));
      }
      return next(error);
    }
    if (!req.file) return next(AppError.badRequest('Pilih file cover terlebih dahulu.', 'COVER_REQUIRED'));
    return next();
  });
}
