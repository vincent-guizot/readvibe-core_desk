import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class ModerationService {
  static async listReviews({ status = 'Flagged' }) {
    const where = {
      publicReview: { [Op.ne]: null },
    };
    if (status) {
      where.moderationStatus = status;
    }

    return await db.reading_activity.findAll({
      where,
      include: [
        {
          model: db.book,
          as: 'book',
          attributes: ['id', 'title', 'image'],
        },
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username'],
          include: [{ model: db.profile, as: 'profile', attributes: ['fullname'] }],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
  }

  static async moderate(id, { status, isSpoiler }) {
    const activity = await db.reading_activity.findByPk(id);
    if (!activity) {
      throw AppError.notFound('Ulasan tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await activity.update({
      moderationStatus: status,
      isSpoiler: isSpoiler !== undefined ? !!isSpoiler : activity.isSpoiler,
    });

    return activity;
  }
}
