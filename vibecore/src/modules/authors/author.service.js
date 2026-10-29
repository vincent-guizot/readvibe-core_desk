import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class AuthorService {
  static async list() {
    return await db.author.findAll({
      order: [['name', 'ASC']],
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

  static async create({ name, bio, image }) {
    return await db.author.create({ name, bio, image });
  }

  static async update(id, { name, bio, image }) {
    const author = await db.author.findByPk(id);
    if (!author) {
      throw AppError.notFound('Penulis tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await author.update({
      name: name !== undefined ? name : author.name,
      bio: bio !== undefined ? bio : author.bio,
      image: image !== undefined ? image : author.image,
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
