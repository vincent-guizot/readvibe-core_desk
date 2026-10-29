import axios from 'axios';
import db from '../models';

class GoogleBooksController {
  static async search(req, res) {
    try {
      const { query } = req.query;
      if (!query || query.trim() === '') {
        return res.status(400).json({ message: 'Parameter query pencarian wajib diisi.' });
      }

      const apiKeyParam = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8${apiKeyParam}`;

      const response = await axios.get(url);
      const items = response.data.items || [];

      // Check which books already exist in our database by ISBN
      const existingIsbns = (
        await db.book.findAll({
          where: { isbn: { [db.Sequelize.Op.ne]: null } },
          attributes: ['isbn'],
        })
      ).map((b) => b.isbn);

      const formatted = items.map((item) => {
        const info = item.volumeInfo || {};
        const isbns = (info.industryIdentifiers || []).map((id) => id.identifier);
        const isbn13 = (info.industryIdentifiers || []).find((id) => id.type === 'ISBN_13')?.identifier;
        const isbn10 = (info.industryIdentifiers || []).find((id) => id.type === 'ISBN_10')?.identifier;
        const primaryIsbn = isbn13 || isbn10 || (isbns.length > 0 ? isbns[0] : null);

        const isAlreadyImported = primaryIsbn ? existingIsbns.includes(primaryIsbn) : false;

        return {
          googleBooksId: item.id,
          title: info.title || 'Untitled',
          authors: info.authors || ['Unknown Author'],
          description: info.description || '',
          publishedDate: info.publishedDate || '',
          pageCount: info.pageCount || 0,
          categories: info.categories || [],
          image:
            info.imageLinks?.thumbnail?.replace('http:', 'https:') ||
            info.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
            '',
          isbn: primaryIsbn,
          embeddable: item.accessInfo?.embeddable || false,
          previewLink: info.previewLink || '',
          isAlreadyImported,
        };
      });

      return res.status(200).json({
        totalResults: formatted.length,
        data: formatted,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mencari di Google Books API.', error: error.message });
    }
  }

  // 1-Click Import into VibeCore catalog
  static async importBook(req, res) {
    try {
      const {
        title,
        authors = [],
        description = '',
        pageCount = 0,
        publishedDate = '',
        categories = [],
        image = '',
        isbn = '',
        googleBooksId = '',
        embeddable = false,
        previewLink = '',
        stock = 5,
        price = 100000,
        moodIds = [],
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Judul buku wajib diisi.' });
      }

      // Check duplicate ISBN
      if (isbn) {
        const existing = await db.book.findOne({ where: { isbn } });
        if (existing) {
          return res.status(409).json({
            message: `Buku dengan ISBN ${isbn} sudah ada di katalog: "${existing.title}".`,
            existingBook: existing,
          });
        }
      }

      // Find or create primary author
      let authorId = null;
      if (authors.length > 0 && authors[0]) {
        const [author] = await db.author.findOrCreate({
          where: { pen_name: authors[0] },
          defaults: { pen_name: authors[0], userId: req.user ? req.user.id : null },
        });
        authorId = author.id;
      }

      // Find or create primary genre / category
      let genreId = null;
      if (categories.length > 0 && categories[0]) {
        const [genre] = await db.genre.findOrCreate({
          where: { name: categories[0] },
          defaults: { name: categories[0], userId: req.user ? req.user.id : null },
        });
        genreId = genre.id;
      }

      const year = publishedDate ? parseInt(publishedDate.slice(0, 4), 10) : new Date().getFullYear();

      const newBook = await db.book.create({
        title,
        description,
        year: isNaN(year) ? null : year,
        page: pageCount ? parseInt(pageCount, 10) : 0,
        stock: stock ? parseInt(stock, 10) : 5,
        price: price ? parseInt(price, 10) : 0,
        image,
        isbn,
        googleBooksId,
        embeddable: !!embeddable,
        previewLink,
        status: 'Available',
        authorId,
        genreId,
        userId: req.user ? req.user.id : null,
      });

      // Link moods if provided
      if (Array.isArray(moodIds) && moodIds.length > 0) {
        for (const moodId of moodIds) {
          await db.book_mood.create({ bookId: newBook.id, moodTagId: moodId });
        }
      }

      const fullBook = await db.book.findByPk(newBook.id, {
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          { model: db.mood_tag, as: 'moods' },
        ],
      });

      return res.status(201).json({
        message: `Buku "${title}" berhasil diimpor dari Google Books ke katalog VibeCore.`,
        data: fullBook,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mengimpor buku dari Google Books.', error: error.message });
    }
  }
}

export default GoogleBooksController;
