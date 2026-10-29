import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class CategoryService {
  static async list() {
    return await db.genre.findAll({
      order: [['name', 'ASC']],
    });
  }

  static async getById(id) {
    const genre = await db.genre.findByPk(id, {
      include: [{ model: db.book, as: 'books' }],
    });
    if (!genre) {
      throw AppError.notFound('Kategori tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    return genre;
  }

  static async create({ name, description }) {
    const existing = await db.genre.findOne({ where: { name } });
    if (existing) {
      throw AppError.conflict(`Kategori "${name}" sudah ada.`, ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }
    return await db.genre.create({ name, description });
  }

  static async update(id, { name, description }) {
    const genre = await db.genre.findByPk(id);
    if (!genre) {
      throw AppError.notFound('Kategori tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    if (name && name !== genre.name) {
      const existing = await db.genre.findOne({ where: { name } });
      if (existing) {
        throw AppError.conflict(`Kategori "${name}" sudah ada.`, ErrorCodes.RESOURCE_ALREADY_EXISTS);
      }
    }

    await genre.update({
      name: name !== undefined ? name : genre.name,
      description: description !== undefined ? description : genre.description,
    });
    return genre;
  }

  static async delete(id) {
    const genre = await db.genre.findByPk(id);
    if (!genre) {
      throw AppError.notFound('Kategori tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await genre.destroy();
    return genre;
  }
}
