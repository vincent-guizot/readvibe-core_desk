import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';
import { buildPaginationMeta } from '../../utils/pagination';

export class BookService {
  static async list({ search, genreId, authorId, mood, page = 1, limit = 20 }) {
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

    const meta = buildPaginationMeta(count, page, limit);
    return { books, meta };
  }

  static async getById(id) {
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
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    return book;
  }

  static async create(payload, userId) {
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
    } = payload;

    if (isbn) {
      const existing = await db.book.findOne({ where: { isbn } });
      if (existing) {
        throw AppError.conflict(
          `Buku dengan ISBN ${isbn} sudah terdaftar: "${existing.title}"`,
          ErrorCodes.RESOURCE_ALREADY_EXISTS
        );
      }
    }

    const book = await db.book.create({
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
      userId: userId || null,
      status: (stock && parseInt(stock, 10) > 0) ? 'Available' : 'Out of Stock',
    });

    if (Array.isArray(moodIds) && moodIds.length > 0) {
      for (const moodId of moodIds) {
        await db.book_mood.create({
          bookId: book.id,
          moodTagId: moodId,
        });
      }
    }

    return await this.getById(book.id);
  }

  static async update(id, payload) {
    const book = await db.book.findByPk(id);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
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
    } = payload;

    if (isbn && isbn !== book.isbn) {
      const existing = await db.book.findOne({ where: { isbn } });
      if (existing && existing.id !== book.id) {
        throw AppError.conflict(`ISBN ${isbn} sudah digunakan oleh buku lain.`, ErrorCodes.RESOURCE_ALREADY_EXISTS);
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

    if (Array.isArray(moodIds)) {
      await db.book_mood.destroy({ where: { bookId: book.id } });
      for (const moodId of moodIds) {
        await db.book_mood.create({ bookId: book.id, moodTagId: moodId });
      }
    }

    return await this.getById(book.id);
  }

  static async delete(id) {
    const book = await db.book.findByPk(id);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await book.destroy();
    return book;
  }
}
