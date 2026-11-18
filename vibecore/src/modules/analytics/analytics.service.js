import db from '../../../models';
import { Op, QueryTypes } from 'sequelize';
import { AppError } from '../../errors/app-error';

function filters(query) {
  const days =
    query.period === 'all' || !query.period ? null : Number(query.period);
  if (days !== null && ![30, 90, 365].includes(days))
    throw AppError.badRequest('Periode harus 30, 90, 365, atau all.');
  const genreId = query.genreId ? Number(query.genreId) : null;
  if (genreId !== null && (!Number.isSafeInteger(genreId) || genreId < 1))
    throw AppError.badRequest('Kategori tidak valid.');
  return {
    since: days ? new Date(Date.now() - days * 86400000).toISOString() : null,
    genreId,
  };
}

const select = (sql, replacements) =>
  db.sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

export class AnalyticsService {
  static async getOverview() {
    const totalBooks = await db.book.count();
    const totalMembers = await db.user.count({ where: { role: 'Member' } });
    const totalFinishedReads = await db.reading_activity.count({
      where: { status: 'Finished' },
    });
    const totalWishlists = await db.wishlist.count();
    const [
      lowStockBooks,
      activeEditorialPicks,
      pendingModeration,
      recentBooks,
    ] = await Promise.all([
      db.book.count({ where: { stock: { [Op.lte]: 5 } } }),
      db.editorial_pick.count({ where: { isActive: true } }),
      db.reading_activity.count({
        where: {
          publicReview: { [Op.ne]: null },
          reviewVisibility: 'Public',
          moderationStatus: { [Op.in]: ['Pending', 'Flagged'] },
        },
      }),
      db.book.findAll({
        attributes: ['id', 'title', 'stock', 'updatedAt'],
        order: [['updatedAt', 'DESC']],
        limit: 5,
      }),
    ]);

    return {
      totalBooks,
      totalMembers,
      totalFinishedReads,
      totalWishlists,
      lowStockBooks,
      activeEditorialPicks,
      pendingModeration,
      recentBooks,
    };
  }

  static async wishlistIntelligence(query) {
    const replacements = filters(query);
    const order =
      query.sort === 'deficit'
        ? '"stockDeficit" DESC, "demand" DESC'
        : '"demand" DESC, b.id ASC';
    const rows = await select(
      `SELECT b.id, b.title, b.image, b.stock, b."genreId", g.name AS category,
      COUNT(w.id)::integer AS demand, GREATEST(COUNT(w.id) - COALESCE(b.stock, 0), 0)::integer AS "stockDeficit"
      FROM wishlists w JOIN books b ON b.id = w."bookId" LEFT JOIN genres g ON g.id = b."genreId"
      WHERE (:since::timestamptz IS NULL OR w."createdAt" >= :since)
        AND (:genreId::integer IS NULL OR b."genreId" = :genreId)
      GROUP BY b.id, g.id ORDER BY ${order}`,
      replacements,
    );
    return {
      rows,
      totalDemand: rows.reduce((sum, row) => sum + row.demand, 0),
      requestedBooks: rows.length,
      stockDeficit: rows.reduce((sum, row) => sum + row.stockDeficit, 0),
    };
  }

  static async readingAnalytics(query) {
    const replacements = filters(query);
    const from = `FROM reading_activities r JOIN books b ON b.id = r."bookId"
      WHERE r.status = 'Finished' AND (:since::timestamptz IS NULL OR COALESCE(r."finishDate", r."updatedAt") >= :since)
      AND (:genreId::integer IS NULL OR b."genreId" = :genreId)`;
    const [summary, moods, genres, trends, highestRated] = await Promise.all([
      select(
        `SELECT COUNT(r.id)::integer AS completed, ROUND(AVG(r.rating)::numeric, 2) AS "averageRating" ${from}`,
        replacements,
      ),
      select(
        `SELECT COALESCE(NULLIF(r."moodTag", ''), 'Tanpa mood') AS name, COUNT(r.id)::integer AS value ${from} GROUP BY name ORDER BY value DESC`,
        replacements,
      ),
      select(
        `SELECT COALESCE((SELECT name FROM genres WHERE id = b."genreId"), 'Tanpa kategori') AS name, COUNT(r.id)::integer AS value ${from} GROUP BY b."genreId" ORDER BY value DESC`,
        replacements,
      ),
      select(
        `SELECT TO_CHAR(COALESCE(r."finishDate", r."updatedAt"), 'YYYY-MM') AS name, COUNT(r.id)::integer AS value ${from} GROUP BY name ORDER BY name`,
        replacements,
      ),
      select(
        `SELECT b.id, b.title, COUNT(r.rating)::integer AS "ratingCount", ROUND(AVG(r.rating)::numeric, 2) AS rating ${from} AND r.rating IS NOT NULL GROUP BY b.id ORDER BY rating DESC, "ratingCount" DESC LIMIT 10`,
        replacements,
      ),
    ]);
    return { ...summary[0], moods, genres, trends, highestRated };
  }

  static async getTopWishlisted(limit = 5) {
    const counts = await db.wishlist.findAll({
      attributes: [
        'bookId',
        [
          db.sequelize.fn('COUNT', db.sequelize.col('wishlist.id')),
          'wishlistCount',
        ],
      ],
      include: [
        {
          model: db.book,
          as: 'book',
          attributes: ['id', 'title', 'image'],
          include: [
            { model: db.author, as: 'author', attributes: ['id', 'pen_name'] },
          ],
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
