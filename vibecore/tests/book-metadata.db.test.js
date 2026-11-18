const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const loadModule = require('./helpers/load-module');

test('metadata survives a real PostgreSQL round-trip without leaving a fixture row', {
  skip: process.env.RUN_BOOKS_DB_TESTS !== '1',
}, async () => {
  const qa = await require('./helpers/qa-api')();
  const db = qa.db;
  const { normalizeBookMetadata } = loadModule(path.join(__dirname, '../src/modules/books/book.metadata.js'));
  const rollback = new Error('Rollback integration fixture');
  let id;
  try {
    await assert.rejects(db.sequelize.transaction(async (transaction) => {
      const book = await db.book.create({
        title: 'Books metadata integration fixture',
        ...normalizeBookMetadata({ subtitle: ' A novel ', publisher: 'Publisher', edition: 'First', language: 'Bahasa Indonesia', format: 'Paperback', widthCm: '13.50', heightCm: 20 }),
      }, { transaction });
      id = book.id;
      await book.reload({ transaction });
      assert.equal(book.subtitle, 'A novel');
      assert.equal(book.publisher, 'Publisher');
      assert.equal(book.edition, 'First');
      assert.equal(book.language, 'Bahasa Indonesia');
      assert.equal(book.format, 'Paperback');
      assert.equal(Number(book.widthCm), 13.5);
      assert.equal(Number(book.heightCm), 20);
      await book.update(normalizeBookMetadata({ subtitle: '', widthCm: null }), { transaction });
      await book.reload({ transaction });
      assert.equal(book.subtitle, null);
      assert.equal(book.widthCm, null);
      assert.equal(book.publisher, 'Publisher');
      throw rollback;
    }), (error) => error === rollback);
    assert.equal(await db.book.findByPk(id), null);
  } finally {
    await qa.close();
  }
});
