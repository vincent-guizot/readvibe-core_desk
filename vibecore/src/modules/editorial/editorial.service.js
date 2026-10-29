import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class EditorialService {
  static async list({ activeOnly = false }) {
    const where = {};
    if (activeOnly) {
      where.active = true;
    }

    return await db.editorial_pick.findAll({
      where,
      include: [
        {
          model: db.book,
          as: 'book',
          include: [
            { model: db.author, as: 'author' },
            { model: db.genre, as: 'genre' },
            { model: db.mood_tag, as: 'moods' },
          ],
        },
      ],
      order: [
        ['curationWeight', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  }

  static async create({ bookId, note, curationWeight = 1.0, active = true }) {
    const book = await db.book.findByPk(bookId);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    const pick = await db.editorial_pick.create({
      bookId,
      note,
      curationWeight: parseFloat(curationWeight) || 1.0,
      active: active !== undefined ? !!active : true,
    });

    return await db.editorial_pick.findByPk(pick.id, {
      include: [{ model: db.book, as: 'book' }],
    });
  }

  static async update(id, { note, curationWeight, active }) {
    const pick = await db.editorial_pick.findByPk(id);
    if (!pick) {
      throw AppError.notFound('Editorial pick tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await pick.update({
      note: note !== undefined ? note : pick.note,
      curationWeight: curationWeight !== undefined ? parseFloat(curationWeight) : pick.curationWeight,
      active: active !== undefined ? !!active : pick.active,
    });

    return pick;
  }

  static async delete(id) {
    const pick = await db.editorial_pick.findByPk(id);
    if (!pick) {
      throw AppError.notFound('Editorial pick tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await pick.destroy();
    return pick;
  }
}
