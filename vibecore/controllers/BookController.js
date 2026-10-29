import { Op } from 'sequelize';
import db from '../models';

class BookController {
  static async getAllBooks(req, res) {
    try {
      const { search, genreId, authorId, mood, limit = 20, page = 1 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { isbn: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (genreId) where.genreId = genreId;
      if (authorId) where.authorId = authorId;

      const includeMood = {
        model: db.mood_tag,
        as: 'moods',
        through: { attributes: [] },
      };

      if (mood) {
        includeMood.where = { name: { [Op.iLike]: `%${mood}%` } };
      }

      const { count, rows: books } = await db.book.findAndCountAll({
        where,
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          includeMood,
          { model: db.editorial_pick, as: 'editorialPicks' },
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      return res.status(200).json({
        total: count,
        page: parseInt(page, 10),
        totalPages: Math.ceil(count / limit),
        data: books,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat katalog buku.', error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const book = await db.book.findByPk(id, {
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          {
            model: db.mood_tag,
            as: 'moods',
            through: { attributes: [] },
          },
          { model: db.editorial_pick, as: 'editorialPicks' },
          {
            model: db.reading_activity,
            as: 'reviews',
            where: { moderationStatus: 'Approved', publicReview: { [Op.ne]: null } },
            required: false,
            include: [
              {
                model: db.user,
                as: 'user',
                attributes: ['id', 'username'],
                include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
              },
            ],
          },
        ],
      });

      if (!book) {
        return res.status(404).json({ message: 'Buku tidak ditemukan.' });
      }

      return res.status(200).json({ data: book });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat detail buku.', error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        title,
        description,
        year,
        page,
        stock = 1,
        price = 0,
        image,
        isbn,
        googleBooksId,
        previewLink,
        embeddable = false,
        authorId,
        genreId,
        moodIds = [],
      } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Judul buku wajib diisi.' });
      }

      // Duplicate ISBN check if provided
      if (isbn) {
        const existingBook = await db.book.findOne({ where: { isbn } });
        if (existingBook) {
          return res.status(409).json({
            message: `Buku dengan ISBN ${isbn} sudah terdaftar: "${existingBook.title}"`,
            existingBook,
          });
        }
      }

      const newBook = await db.book.create({
        title,
        description,
        year: year ? parseInt(year, 10) : null,
        page: page ? parseInt(page, 10) : null,
        stock: stock ? parseInt(stock, 10) : 1,
        price: price ? parseInt(price, 10) : 0,
        image,
        isbn,
        googleBooksId,
        previewLink,
        embeddable: !!embeddable,
        authorId: authorId ? parseInt(authorId, 10) : null,
        genreId: genreId ? parseInt(genreId, 10) : null,
        userId: req.user ? req.user.id : null,
        status: stock > 0 ? 'Available' : 'Out of Stock',
      });

      // Link mood tags
      if (Array.isArray(moodIds) && moodIds.length > 0) {
        for (const moodId of moodIds) {
          await db.book_mood.create({
            bookId: newBook.id,
            moodTagId: moodId,
          });
        }
      }

      const createdWithAssociations = await db.book.findByPk(newBook.id, {
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          { model: db.mood_tag, as: 'moods' },
        ],
      });

      return res.status(201).json({
        message: 'Buku berhasil ditambahkan.',
        data: createdWithAssociations,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menambahkan buku.', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const book = await db.book.findByPk(id);
      if (!book) {
        return res.status(404).json({ message: 'Buku tidak ditemukan.' });
      }

      const {
        title,
        description,
        year,
        page,
        stock,
        price,
        image,
        isbn,
        googleBooksId,
        previewLink,
        embeddable,
        authorId,
        genreId,
        moodIds,
      } = req.body;

      if (isbn && isbn !== book.isbn) {
        const existingBook = await db.book.findOne({ where: { isbn } });
        if (existingBook && existingBook.id !== book.id) {
          return res.status(409).json({ message: `ISBN ${isbn} sudah digunakan oleh buku lain.` });
        }
      }

      await book.update({
        title: title !== undefined ? title : book.title,
        description: description !== undefined ? description : book.description,
        year: year !== undefined ? parseInt(year, 10) : book.year,
        page: page !== undefined ? parseInt(page, 10) : book.page,
        stock: stock !== undefined ? parseInt(stock, 10) : book.stock,
        price: price !== undefined ? parseInt(price, 10) : book.price,
        image: image !== undefined ? image : book.image,
        isbn: isbn !== undefined ? isbn : book.isbn,
        googleBooksId: googleBooksId !== undefined ? googleBooksId : book.googleBooksId,
        previewLink: previewLink !== undefined ? previewLink : book.previewLink,
        embeddable: embeddable !== undefined ? !!embeddable : book.embeddable,
        authorId: authorId !== undefined ? authorId : book.authorId,
        genreId: genreId !== undefined ? genreId : book.genreId,
        status: (stock !== undefined ? parseInt(stock, 10) : book.stock) > 0 ? 'Available' : 'Out of Stock',
      });

      // Update moods if provided
      if (Array.isArray(moodIds)) {
        await db.book_mood.destroy({ where: { bookId: book.id } });
        for (const moodId of moodIds) {
          await db.book_mood.create({ bookId: book.id, moodTagId: moodId });
        }
      }

      const updated = await db.book.findByPk(book.id, {
        include: [
          { model: db.author, as: 'author' },
          { model: db.genre, as: 'genre' },
          { model: db.mood_tag, as: 'moods' },
        ],
      });

      return res.status(200).json({ message: 'Buku berhasil diperbarui.', data: updated });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memperbarui buku.', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const book = await db.book.findByPk(id);
      if (!book) {
        return res.status(404).json({ message: 'Buku tidak ditemukan.' });
      }

      await book.destroy();
      return res.status(200).json({ message: `Buku "${book.title}" berhasil dihapus.` });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal menghapus buku.', error: error.message });
    }
  }
}

export default BookController;
