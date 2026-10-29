import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class ReadingService {
  static async getMyActivities(userId, status) {
    const where = { userId };
    if (status) where.status = status;

    return await db.reading_activity.findAll({
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
      order: [['updatedAt', 'DESC']],
    });
  }

  static async getUserFinishedReads(userId) {
    const user = await db.user.findByPk(userId, {
      attributes: ['id', 'username'],
      include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
    });
    if (!user) {
      throw AppError.notFound('Pengguna tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    const finished = await db.reading_activity.findAll({
      where: {
        userId,
        status: 'Finished',
        moderationStatus: 'Approved',
      },
      attributes: [
        'id',
        'userId',
        'bookId',
        'status',
        'startDate',
        'finishDate',
        'rating',
        'quote',
        'publicReview',
        'moodTag',
        'isSpoiler',
        'createdAt',
      ],
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
      order: [['finishDate', 'DESC']],
    });

    return { user, finished };
  }

  static async startReading(userId, { bookId, startDate = new Date() }) {
    const book = await db.book.findByPk(bookId);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    let activity = await db.reading_activity.findOne({
      where: { userId, bookId },
    });

    if (activity) {
      await activity.update({
        status: 'Reading',
        startDate: startDate || new Date(),
      });
    } else {
      activity = await db.reading_activity.create({
        userId,
        bookId,
        status: 'Reading',
        startDate: startDate || new Date(),
      });
    }

    // Optionally remove from wishlist
    await db.wishlist.destroy({ where: { userId, bookId } });

    return await db.reading_activity.findByPk(activity.id, {
      include: [{ model: db.book, as: 'book' }],
    });
  }

  static async finishReading(userId, payload) {
    const {
      bookId,
      rating,
      quote,
      privateNote,
      publicReview,
      moodTag,
      isSpoiler = false,
      finishDate = new Date(),
    } = payload;

    const book = await db.book.findByPk(bookId);
    if (!book) {
      throw AppError.notFound('Buku tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    let activity = await db.reading_activity.findOne({
      where: { userId, bookId },
    });

    if (activity) {
      await activity.update({
        status: 'Finished',
        rating: rating !== undefined ? rating : activity.rating,
        quote: quote !== undefined ? quote : activity.quote,
        privateNote: privateNote !== undefined ? privateNote : activity.privateNote,
        publicReview: publicReview !== undefined ? publicReview : activity.publicReview,
        moodTag: moodTag !== undefined ? moodTag : activity.moodTag,
        isSpoiler: isSpoiler !== undefined ? !!isSpoiler : activity.isSpoiler,
        finishDate: finishDate || new Date(),
        moderationStatus: 'Approved',
      });
    } else {
      activity = await db.reading_activity.create({
        userId,
        bookId,
        status: 'Finished',
        startDate: new Date(),
        finishDate: finishDate || new Date(),
        rating,
        quote,
        privateNote,
        publicReview,
        moodTag,
        isSpoiler: !!isSpoiler,
        moderationStatus: 'Approved',
      });
    }

    await db.wishlist.destroy({ where: { userId, bookId } });

    return await db.reading_activity.findByPk(activity.id, {
      include: [
        {
          model: db.book,
          as: 'book',
          include: [{ model: db.author, as: 'author' }],
        },
      ],
    });
  }

  static async getVibeCard(id, currentUserId) {
    const activity = await db.reading_activity.findByPk(id, {
      include: [
        {
          model: db.book,
          as: 'book',
          include: [{ model: db.author, as: 'author' }],
        },
        {
          model: db.user,
          as: 'user',
          attributes: ['id', 'username'],
          include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
        },
      ],
    });

    if (!activity) {
      throw AppError.notFound('Catatan membaca tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    if (activity.userId !== currentUserId && activity.status !== 'Finished') {
      throw AppError.forbidden('Hanya catatan membaca yang selesai yang dapat dibagikan.');
    }

    return {
      cardRatio: '9:16',
      title: activity.book.title,
      author: activity.book.author ? activity.book.author.name : 'Unknown Author',
      coverImage: activity.book.image,
      rating: activity.rating,
      quote: activity.quote || '',
      mood: activity.moodTag || 'Thoughtful',
      reader: activity.user ? activity.user.profile?.fullname || activity.user.username : '',
      finishDate: activity.finishDate,
    };
  }

  static async deleteActivity(id, userId) {
    const activity = await db.reading_activity.findOne({
      where: { id, userId },
    });
    if (!activity) {
      throw AppError.notFound('Aktivitas tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await activity.destroy();
    return true;
  }
}
