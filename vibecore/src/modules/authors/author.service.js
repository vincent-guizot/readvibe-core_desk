import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class AuthorService {
  static async list() {
    return await db.author.findAll({
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

  static async create({ name, pen_name }) {
    const finalName = pen_name || name;
    return await db.author.create({ pen_name: finalName });
  }

  static async update(id, { name, pen_name }) {
    const author = await db.author.findByPk(id);
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    const finalName = pen_name || name || author.pen_name;
    await author.update({
      pen_name: finalName,
    });
    return author;
  }

  static async delete(id) {
    const author = await db.author.findByPk(id);
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await author.destroy();
    return author;
  }
}
