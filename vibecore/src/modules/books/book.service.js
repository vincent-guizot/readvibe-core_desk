import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';
import { buildPaginationMeta } from '../../utils/pagination';
import { normalizeBookMetadata } from './book.metadata';

export class BookService {
  static async list({ search, genreId, authorId, mood, moodId, stock, sort = 'newest', googleBooksId, page = 1, limit = 20 }) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      const matchingAuthors = await db.author.findAll({ attributes: ['id'], where: { pen_name: { [Op.iLike]: `%${search}%` } } });
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } },
        { authorId: { [Op.in]: matchingAuthors.map((author) => author.id) } },
      ];
    }
    if (genreId) where.genreId = genreId;
    if (authorId) where.authorId = authorId;
    if (googleBooksId) where.googleBooksId = googleBooksId;
    if (stock === 'available') where.stock = { [Op.gt]: 5 };
    if (stock === 'low') where.stock = { [Op.between]: [1, 5] };
    if (stock === 'empty') where.stock = 0;

    const includeMood = {
      model: db.mood_tag,
      as: 'moods',
      through: { attributes: [] },
    };

    if (mood) {
      includeMood.where = { name: { [Op.iLike]: `%${mood}%` } };
    }
    if (moodId) includeMood.where = { id: moodId };
    const orders = { newest: [['createdAt', 'DESC'], ['id', 'DESC']], title: [['title', 'ASC'], ['id', 'ASC']], stock: [['stock', 'DESC'], ['id', 'ASC']] };

    const { count, rows: books } = await db.book.findAndCountAll({
      where,
      include: [
        { model: db.author, as: 'author' },
        { model: db.genre, as: 'genre' },
        includeMood,
        { model: db.editorial_pick, as: 'editorialPicks' },
      ],
      distinct: true,
      order: orders[sort] || orders.newest,
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
          attributes: ['id', 'rating', 'reviewTitle', 'publicReview', 'isSpoiler', 'createdAt'],
          where: { moderationStatus: 'Approved', reviewVisibility: 'Public', [Op.and]: [{ publicReview: { [Op.ne]: null } }, { publicReview: { [Op.ne]: '' } }] },
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

    if (googleBooksId) {
      const existing = await db.book.findOne({ where: { googleBooksId } });
      if (existing) {
        throw AppError.conflict(
          `Buku dari Google Books ini sudah terdaftar: "${existing.title}"`,
          ErrorCodes.RESOURCE_ALREADY_EXISTS
        );
      }
    }

    const book = await db.book.create({
      ...normalizeBookMetadata(payload),
      title,
      description,
      year: year ? parseInt(year, 10) : null,
      page: page ? parseInt(page, 10) : null,
      stock: stock !== undefined && stock !== null && stock !== '' ? parseInt(stock, 10) : 1,
      price: price !== undefined && price !== null && price !== '' ? parseInt(price, 10) : 0,
      image,
      isbn,
      googleBooksId,
      previewLink,
      embeddable: !!embeddable,
      authorId: authorId ? parseInt(authorId, 10) : null,
      genreId: genreId ? parseInt(genreId, 10) : null,
      userId: userId || null,
      status: parseInt(stock, 10) > 0 ? 'Available' : 'Out of Stock',
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

    if (googleBooksId && googleBooksId !== book.googleBooksId) {
      const existing = await db.book.findOne({ where: { googleBooksId } });
      if (existing && existing.id !== book.id) {
        throw AppError.conflict('Google Books ID sudah digunakan oleh buku lain.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
      }
    }

    await book.update({
      ...normalizeBookMetadata(payload),
      title: title !== undefined ? title : book.title,
      description: description !== undefined ? description : book.description,
      year: year !== undefined ? (year === null ? null : parseInt(year, 10)) : book.year,
      page: page !== undefined ? (page === null ? null : parseInt(page, 10)) : book.page,
      stock: stock !== undefined ? parseInt(stock, 10) : book.stock,
      price: price !== undefined ? parseInt(price, 10) : book.price,
      image: image !== undefined ? image : book.image,
      isbn: isbn !== undefined ? isbn : book.isbn,
      googleBooksId: googleBooksId !== undefined ? googleBooksId : book.googleBooksId,
      previewLink: previewLink !== undefined ? previewLink : book.previewLink,
      embeddable: embeddable !== undefined ? !!embeddable : book.embeddable,
      authorId: authorId !== undefined ? (authorId ? parseInt(authorId, 10) : null) : book.authorId,
      genreId: genreId !== undefined ? (genreId ? parseInt(genreId, 10) : null) : book.genreId,
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
