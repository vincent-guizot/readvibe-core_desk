import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class ModerationService {
  static publicAttributes = [
    'id',
    'bookId',
    'userId',
    'publicReview',
    'rating',
    'isSpoiler',
    'isFlagged',
    'flagReason',
    'moderationStatus',
    'moderationReason',
    'moderatedBy',
    'createdAt',
    'updatedAt',
  ];
  static async listReviews({ status = 'Flagged' }) {
    const where = {
      publicReview: { [Op.ne]: null },
    };
    if (status) {
      where.moderationStatus = status;
    }

    return await db.reading_activity.findAll({
      where,
      attributes: this.publicAttributes,
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
          include: [
            { model: db.profile, as: 'profile', attributes: ['fullname'] },
          ],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
  }

  static async getById(id) {
    const review = await db.reading_activity.findByPk(id, {
      attributes: this.publicAttributes,
      include: [
        { model: db.book, as: 'book', attributes: ['id', 'title', 'image'] },
        { model: db.user, as: 'user', attributes: ['id', 'username'] },
      ],
    });
    if (!review || !review.publicReview)
      throw AppError.notFound('Ulasan tidak ditemukan.');
    return review;
  }

  static async moderate(id, { status, isSpoiler, reason }, actorId) {
    const activity = await db.reading_activity.findByPk(id);
    if (!activity || !activity.publicReview) {
      throw AppError.notFound('Ulasan tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await activity.update({
      moderationStatus: status,
      moderationReason: reason.trim(),
      moderatedBy: actorId,
      isFlagged: status === 'Flagged',
      ...(status === 'Removed' && { publicReview: null }),
      isSpoiler: isSpoiler !== undefined ? !!isSpoiler : activity.isSpoiler,
    });

    return { id: activity.id, moderationStatus: activity.moderationStatus };
  }
}
