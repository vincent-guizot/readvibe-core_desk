import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class AuthorService {
  static async list() {
    return await db.author.findAll({
      include: [{ model: db.book, as: 'books', attributes: ['id'] }],
      order: [['pen_name', 'ASC']],
    });
  }

  static async getById(id) {
    const author = await db.author.findByPk(id, {
      include: [{ model: db.book, as: 'books' }],
    });
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    return author;
  }

  static async create({ name, pen_name, bio }) {
    const finalName = pen_name || name;
    return await db.author.create({ pen_name: finalName.trim(), bio: bio?.trim() || null });
  }

  static async update(id, { name, pen_name, bio }) {
    const author = await db.author.findByPk(id);
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    const finalName = pen_name || name || author.pen_name;
    await author.update({
      pen_name: finalName.trim(),
      bio: bio !== undefined ? bio.trim() || null : author.bio,
    });
    return author;
  }

  static async delete(id) {
    const author = await db.author.findByPk(id);
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    const bookCount = await db.book.count({ where: { authorId: author.id } });
    if (bookCount > 0) {
      throw AppError.conflict('Penulis masih terhubung ke buku. Pindahkan atau hapus buku tersebut terlebih dahulu.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    await author.destroy();
    return author;
  }
}
