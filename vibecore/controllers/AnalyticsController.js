import { fn, col, literal } from 'sequelize';
import db from '../models';

class AnalyticsController {
  // Personal stats for ReadVibe user
  static async getUserReadingStats(req, res) {
    try {
      const userId = req.user.id;

      const [finishedCount, readingCount, wishlistCount] = await Promise.all([
        db.reading_activity.count({ where: { userId, status: 'Finished' } }),
        db.reading_activity.count({ where: { userId, status: 'Reading' } }),
        db.wishlist.count({ where: { userId } }),
      ]);

      // Most read moods
      const moodStats = await db.reading_activity.findAll({
        where: { userId, status: 'Finished', moodTag: { [db.Sequelize.Op.ne]: null } },
        attributes: ['moodTag', [fn('COUNT', col('id')), 'count']],
        group: ['moodTag'],
        order: [[literal('count'), 'DESC']],
        limit: 5,
      });

      return res.status(200).json({
        finishedCount,
        readingCount,
        wishlistCount,
        moodStats,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat statistik membaca pengguna.', error: error.message });
    }
  }

  // Dashboard KPI for VibeDesk
  static async getDashboardKPI(req, res) {
    try {
      const [totalBooks, totalWishlists, totalFinished, totalMembers] = await Promise.all([
        db.book.count(),
        db.wishlist.count(),
        db.reading_activity.count({ where: { status: 'Finished' } }),
        db.user.count({ where: { role: 'Member' } }),
      ]);

      return res.status(200).json({
        totalBooks,
        totalWishlists,
        totalFinished,
        totalMembers,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat KPI dashboard.', error: error.message });
    }
  }

  // Wishlist Intelligence for VibeDesk
  static async getWishlistIntelligence(req, res) {
    try {
      // Books most added to wishlist (aggregated, no user secrets)
      const topWishlistBooks = await db.wishlist.findAll({
        attributes: ['bookId', [fn('COUNT', col('wishlist.id')), 'wishlistCount']],
        include: [
          {
            model: db.book,
            as: 'book',
            attributes: ['id', 'title', 'stock', 'image'],
            include: [
              { model: db.author, as: 'author', attributes: ['pen_name'] },
              { model: db.mood_tag, as: 'moods', attributes: ['name', 'icon', 'color'], through: { attributes: [] } },
            ],
          },
        ],
        group: [
          'bookId',
          'book.id',
          'book.title',
          'book.stock',
          'book.image',
          'book->author.id',
          'book->author.pen_name',
          'book->moods.id',
          'book->moods.name',
          'book->moods.icon',
          'book->moods.color',
          'book->moods->book_mood.id',
        ],
        order: [[literal('"wishlistCount"'), 'DESC']],
        limit: 10,
      });

      // Priority breakdown
      const priorityBreakdown = await db.wishlist.findAll({
        attributes: ['priority', [fn('COUNT', col('id')), 'count']],
        group: ['priority'],
      });

      return res.status(200).json({
        topWishlistBooks,
        priorityBreakdown,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat analitik Wishlist Intelligence.', error: error.message });
    }
  }

  // Reading Trends for VibeDesk
  static async getReadingTrends(req, res) {
    try {
      // Mood distribution of finished reads (aggregated)
      const moodTrends = await db.reading_activity.findAll({
        where: {
          status: 'Finished',
          moodTag: { [db.Sequelize.Op.ne]: null },
        },
        attributes: ['moodTag', [fn('COUNT', col('id')), 'totalReads']],
        group: ['moodTag'],
        order: [[literal('"totalReads"'), 'DESC']],
        limit: 8,
      });

      // Average rating
      const ratingStats = await db.reading_activity.findAll({
        where: {
          status: 'Finished',
          rating: { [db.Sequelize.Op.ne]: null },
        },
        attributes: [
          [fn('AVG', col('rating')), 'averageRating'],
          [fn('COUNT', col('id')), 'ratedCount'],
        ],
      });

      return res.status(200).json({
        moodTrends,
        ratingStats: ratingStats[0] || { averageRating: 0, ratedCount: 0 },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Gagal memuat analitik tren membaca.', error: error.message });
    }
  }
}

export default AnalyticsController;
