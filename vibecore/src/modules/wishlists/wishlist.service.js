import db from '../../../models';
import { AppError } from '../../errors/app-error';
import { ErrorCodes } from '../../contracts/error-codes';

export class WishlistService {
  static async getMyWishlist(userId) {
    return await db.wishlist.findAll({
      where: { userId },
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
      order: [['createdAt', 'DESC']],
    });
  }

  static async getUserPublicWishlist(userId) {
    const user = await db.user.findByPk(userId, {
      attributes: ['id', 'username'],
      include: [{ model: db.profile, as: 'profile', attributes: ['fullname', 'image'] }],
    });
    if (!user) {
      throw AppError.notFound('Pengguna tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    const items = await db.wishlist.findAll({
      where: {
        userId,
        visibility: 'Public',
      },
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
      order: [['createdAt', 'DESC']],
    });

    return { user, items };
  }

  static async add(userId, { bookId, priority = 'Medium', reason = '', visibility = 'Public' }) {
    const existing = await db.wishlist.findOne({
      where: { userId, bookId },
    });
    if (existing) {
      throw AppError.conflict('Buku ini sudah ada dalam wishlist Anda.', ErrorCodes.RESOURCE_ALREADY_EXISTS);
    }

    const item = await db.wishlist.create({
      userId,
      bookId,
      priority,
      reason,
      visibility,
    });

    return await db.wishlist.findByPk(item.id, {
      include: [
        {
          model: db.book,
          as: 'book',
          include: [{ model: db.author, as: 'author' }],
        },
      ],
    });
  }

  static async update(id, userId, { priority, reason, visibility }) {
    const item = await db.wishlist.findOne({ where: { id, userId } });
    if (!item) {
      throw AppError.notFound('Item wishlist tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }

    await item.update({
      priority: priority !== undefined ? priority : item.priority,
      reason: reason !== undefined ? reason : item.reason,
      visibility: visibility !== undefined ? visibility : item.visibility,
    });

    return item;
  }

  static async remove(id, userId) {
    const item = await db.wishlist.findOne({ where: { id, userId } });
    if (!item) {
      throw AppError.notFound('Item wishlist tidak ditemukan.', ErrorCodes.NOT_FOUND);
    }
    await item.destroy();
    return true;
  }
}
