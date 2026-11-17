import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { AppError } from '../../errors/app-error';

export const COVER_DIRECTORY = path.resolve(process.env.BOOK_COVER_STORAGE_DIR || path.join(__dirname, '../../../storage/book-covers'));
const filenamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

export class BookCoverService {
  static async store(file, directory = COVER_DIRECTORY) {
    let buffer;
    try {
      const image = sharp(file.buffer, { limitInputPixels: 20000000, animated: false });
      const metadata = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) > 1) {
        throw new Error('Unsupported image');
      }
      buffer = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    } catch {
      throw AppError.badRequest('File bukan gambar JPG, PNG, atau WEBP statis yang valid (maksimal 20 megapiksel).', 'INVALID_COVER_CONTENT');
    }
    const filename = `${randomUUID()}.webp`;
    try {
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
    } catch {
      throw new AppError('Cover gagal disimpan. Periksa penyimpanan server.', 500, 'COVER_STORAGE_ERROR');
    }
    return { path: `/api/books/covers/${filename}`, size: buffer.length, mimeType: 'image/webp' };
  }

  static resolvePath(filename) {
    if (!filenamePattern.test(filename)) throw AppError.notFound('Cover tidak ditemukan.');
    return path.join(COVER_DIRECTORY, filename);
  }
}
