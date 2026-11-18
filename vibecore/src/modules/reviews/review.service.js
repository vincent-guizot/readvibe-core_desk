import { Op } from 'sequelize';
import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class ReviewService {
  static async getBookReviews(bookId) {
    return await db.reading_activity.findAll({
      where: {
        bookId,
        [Op.and]: [{ publicReview: { [Op.ne]: null } }, { publicReview: { [Op.ne]: '' } }],
        moderationStatus: 'Approved',
        reviewVisibility: 'Public',
      },
      attributes: [
        'id',
        'bookId',
        'rating',
        'quote',
        'publicReview',
        'reviewTitle',
        'moodTag',
        'isSpoiler',
        'createdAt',
      ],
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username'],
          include: [
            {
              model: db.profile,
              as: 'profile',
              attributes: ['fullname', 'image'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  static async submitReview(
    userId,
    { bookId, rating, quote, publicReview, reviewTitle, moodTag, isSpoiler },
  ) {
    if (!await db.book.findByPk(bookId)) throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    let activity = await db.reading_activity.findOne({
      where: { userId, bookId },
    });

    if (activity) {
      await activity.update({
        rating: rating !== undefined ? rating : activity.rating,
        quote: quote !== undefined ? quote : activity.quote,
        publicReview,
        reviewVisibility: 'Public',
        reviewTitle: reviewTitle ?? '',
        moodTag: moodTag !== undefined ? moodTag : activity.moodTag,
        isSpoiler: !!isSpoiler,
        moderationStatus: 'Approved',
      });
    } else {
      activity = await db.reading_activity.create({
        userId,
        bookId,
        status: 'Finished',
        rating: rating || 5,
        quote: quote || '',
        publicReview,
        reviewVisibility: 'Public',
        reviewTitle,
        moodTag: moodTag || 'Thoughtful',
        isSpoiler: !!isSpoiler,
        moderationStatus: 'Approved',
        startDate: new Date(),
        finishDate: new Date(),
      });
    }

    return await db.reading_activity.findByPk(activity.id, {
      include: [
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username'],
          include: [
            {
              model: db.profile,
              as: 'profile',
              attributes: ['fullname', 'image'],
            },
          ],
        },
      ],
    });
  }

  static async reportReview(id, { reason }) {
    if (
      reason !== undefined &&
      (typeof reason !== 'string' || reason.length > 255)
    )
      throw AppError.badRequest(
        'Alasan laporan harus berupa teks maksimal 255 karakter.',
      );
    const activity = await db.reading_activity.findByPk(id);
    if (!activity || !activity.publicReview || activity.reviewVisibility === 'Private') {
      throw AppError.notFound('Ulasan tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    // Flag for moderation review
    await activity.update({
      moderationStatus: 'Flagged',
      isFlagged: true,
      flagReason: reason?.trim() || null,
    });
    return true;
  }
}
