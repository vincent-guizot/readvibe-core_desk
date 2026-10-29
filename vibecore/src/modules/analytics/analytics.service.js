import db from '../../../models';

export class AnalyticsService {
  static async getOverview() {
    const totalBooks = await db.book.count();
    const totalMembers = await db.user.count({ where: { role: 'Member' } });
    const totalFinishedReads = await db.reading_activity.count({ where: { status: 'Finished' } });
    const totalWishlists = await db.wishlist.count();

    return {
      totalBooks,
      totalMembers,
      totalFinishedReads,
      totalWishlists,
    };
  }

  static async getTopWishlisted(limit = 5) {
    const counts = await db.wishlist.findAll({
      attributes: [
        'bookId',
        [db.sequelize.fn('COUNT', db.sequelize.col('wishlist.id')), 'wishlistCount'],
      ],
      include: [
        {
          model: db.book,
          as: 'book',
          attributes: ['id', 'title', 'image'],
          include: [{ model: db.author, as: 'author', attributes: ['name'] }],
        },
      ],
      group: ['wishlist.bookId', 'book.id', 'book->author.id'],
      order: [[db.sequelize.literal('"wishlistCount"'), 'DESC']],
      limit: parseInt(limit, 10),
    });

    return counts;
  }

  static async getMoodDistribution() {
    const moods = await db.mood_tag.findAll({
      attributes: ['id', 'name', 'color'],
      include: [
        {
          model: db.book,
          as: 'books',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    return moods.map((m) => ({
      id: m.id,
      name: m.name,
      color: m.color,
      bookCount: m.books ? m.books.length : 0,
    }));
  }
}
