const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const load = require('./helpers/load-module');
const source = (file) => path.join(__dirname, '../src', file);

test(
  'backoffice PostgreSQL aggregates and new columns work without changing existing data',
  { skip: process.env.RUN_BOOKS_DB_TESTS !== '1' },
  async (t) => {
    const qa = await require('./helpers/qa-api')();
    const db = qa.db;
    const { AppError } = load(source('errors/app-error.js'));
    try {
      const { AnalyticsService } = load(
        source('modules/analytics/analytics.service.js'),
        {
          '../../../models': db,
          sequelize: require('sequelize'),
          '../../errors/app-error': { AppError },
        },
      );
      await t.test(
        'live aggregate SQL accepts each period and an empty category',
        async () => {
          const overview = await AnalyticsService.getOverview();
          assert.equal(typeof overview.pendingModeration, 'number');
          for (const period of ['all', '30', '90', '365']) {
            const wishlist = await AnalyticsService.wishlistIntelligence({
              period,
              sort: 'deficit',
            });
            assert.equal(
              wishlist.totalDemand,
              wishlist.rows.reduce((sum, row) => sum + row.demand, 0),
            );
            assert.ok(wishlist.rows.every((row) => !('userId' in row)));
            const reading = await AnalyticsService.readingAnalytics({
              period,
              genreId: 2147483647,
            });
            assert.equal(reading.completed, 0);
            assert.equal(reading.averageRating, null);
          }
          const books = load(source('modules/books/book.service.js'), {
            '../../../models': db,
            sequelize: require('sequelize'),
            '../../errors/app-error': { AppError },
            '../../contracts/error-codes': { ErrorCodes: {} },
            '../../utils/pagination': load(source('utils/pagination.js')),
            './book.metadata': load(source('modules/books/book.metadata.js')),
          });
          const filtered = await books.BookService.list({
            search: 'QA-nonexistent-filter-7d91f32c',
            page: 0,
            limit: 500,
            moodId: 2147483647,
            stock: 'empty',
            sort: 'title',
          });
          assert.equal(filtered.meta.currentPage, 1);
          assert.equal(filtered.meta.itemsPerPage, 100);
          assert.equal(filtered.books.length, 0);
        },
      );
      await t.test(
        'settings and moderation audit persist inside a rolled-back transaction',
        async () => {
          const rollback = new Error('Rollback backoffice QA fixture');
          const key = `qa-${randomUUID()}`;
          let activityId;
          await assert.rejects(
            db.sequelize.transaction(async (transaction) => {
              const setting = await db.application_setting.create(
                {
                  id: key,
                  value: { curationWeightBonus: 0.42 },
                  updatedBy: null,
                },
                { transaction },
              );
              await setting.reload({ transaction });
              assert.equal(setting.value.curationWeightBonus, 0.42);
              const user = await db.user.create(
                {
                  username: key,
                  email: `${key}@example.invalid`,
                  password: 'unused-transaction-fixture',
                },
                { transaction },
              );
              const genre = await db.genre.create(
                { name: key },
                { transaction },
              );
              const book = await db.book.create(
                { title: key, genreId: genre.id, stock: 0 },
                { transaction },
              );
              const activity = await db.reading_activity.create(
                {
                  userId: user.id,
                  bookId: book.id,
                  status: 'Finished',
                  finishDate: new Date(),
                  rating: 4,
                  moodTag: 'Calm QA',
                  privateNote: 'Never exposed',
                  moderationReason: 'QA reason',
                  moderatedBy: null,
                },
                { transaction },
              );
              activityId = activity.id;
              await activity.reload({ transaction });
              assert.equal(activity.moderationReason, 'QA reason');
              await db.wishlist.create(
                { userId: user.id, bookId: book.id },
                { transaction },
              );
              const models = {
                ...db,
                sequelize: {
                  query: (sql, options) =>
                    db.sequelize.query(sql, { ...options, transaction }),
                },
              };
              const { AnalyticsService: transactional } = load(
                source('modules/analytics/analytics.service.js'),
                {
                  '../../../models': models,
                  sequelize: require('sequelize'),
                  '../../errors/app-error': { AppError },
                },
              );
              const reading = await transactional.readingAnalytics({
                period: '30',
                genreId: genre.id,
              });
              assert.equal(reading.completed, 1);
              assert.equal(Number(reading.averageRating), 4);
              assert.equal(reading.moods[0].name, 'Calm QA');
              assert.equal(reading.genres[0].name, key);
              assert.equal(reading.trends[0].value, 1);
              assert.equal(reading.highestRated[0].id, book.id);
              assert.ok(!JSON.stringify(reading).includes('Never exposed'));
              const wishlist = await transactional.wishlistIntelligence({
                period: '30',
                genreId: genre.id,
              });
              assert.equal(wishlist.totalDemand, 1);
              assert.equal(wishlist.stockDeficit, 1);
              throw rollback;
            }),
            (error) => error === rollback,
          );
          assert.equal(await db.application_setting.findByPk(key), null);
          assert.equal(await db.reading_activity.findByPk(activityId), null);
        },
      );
    } finally {
      await qa.close();
    }
  },
);
