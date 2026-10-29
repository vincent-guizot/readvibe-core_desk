import axios from 'axios';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

export class GoogleBooksClient {
  static async searchVolumes(query, maxResults = 8) {
    const keyParam = ENV.GOOGLE_BOOKS_API_KEY ? `&key=${ENV.GOOGLE_BOOKS_API_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}${keyParam}`;

    try {
      const response = await axios.get(url, { timeout: 8000 });
      return response.data.items || [];
    } catch (err) {
      logger.error('Google Books API search error:', err.message);
      throw err;
    }
  }
}
