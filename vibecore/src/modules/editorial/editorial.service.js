import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class EditorialService {
  static async list({ activeOnly = false }) {
    const where = {};
    if (activeOnly) {
      where.isActive = true;
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

  static async create({ bookId, tagline, note, curatorNotes, curationWeight = 50, active = true, isActive }) {
    const book = await db.book.findByPk(bookId);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    const resolvedActive = isActive !== undefined ? !!isActive : (active !== undefined ? !!active : true);
    const resolvedNotes = curatorNotes || note || '';
    let resolvedWeight = parseFloat(curationWeight) || 50;
    if (resolvedWeight > 0 && resolvedWeight <= 1.0) {
      resolvedWeight = Math.round(resolvedWeight * 100);
    } else {
      resolvedWeight = Math.round(resolvedWeight);
    }

    const pick = await db.editorial_pick.create({
      bookId,
      tagline: tagline || 'Pilihan Redaksi',
      curatorNotes: resolvedNotes,
      curationWeight: resolvedWeight,
      isActive: resolvedActive,
    });

    return await db.editorial_pick.findByPk(pick.id, {
      include: [{ model: db.book, as: 'book' }],
    });
  }

  static async update(id, { tagline, note, curatorNotes, curationWeight, active, isActive }) {
    const pick = await db.editorial_pick.findByPk(id);
    if (!pick) {
      throw AppError.notFound('Editorial pick tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    const updates = {};
    if (tagline !== undefined) updates.tagline = tagline;
    if (curatorNotes !== undefined || note !== undefined) updates.curatorNotes = curatorNotes !== undefined ? curatorNotes : note;
    if (curationWeight !== undefined) {
      let weightVal = parseFloat(curationWeight) || 50;
      if (weightVal > 0 && weightVal <= 1.0) {
        weightVal = Math.round(weightVal * 100);
      } else {
        weightVal = Math.round(weightVal);
      }
      updates.curationWeight = weightVal;
    }
    if (isActive !== undefined || active !== undefined) updates.isActive = isActive !== undefined ? !!isActive : !!active;

    await pick.update(updates);
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
