import axios from 'axios';
import { ENV } from '../../config/env';
import { AppError } from '../../errors/app-error';

export class GoogleBooksClient {
  static async searchVolumes(query, maxResults = 8) {
    const keyParam = ENV.GOOGLE_BOOKS_API_KEY ? `&key=${ENV.GOOGLE_BOOKS_API_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}${keyParam}`;

    try {
      const response = await axios.get(url, { timeout: 8000 });
      return response.data.items || [];
    } catch (err) {
      throw new AppError(err.response?.status === 429 ? 'Kuota Google Books tercapai. Coba kembali nanti.' : 'Google Books tidak dapat dihubungi. Coba kembali nanti.', 502, 'GOOGLE_BOOKS_ERROR');
    }
  }
}
