const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const loadModule = require('./helpers/load-module');
const { Sequelize, DataTypes } = require('sequelize');

const metadata = loadModule(path.join(__dirname, '../src/modules/books/book.metadata.js'));
const validators = loadModule(path.join(__dirname, '../src/modules/books/book.validator.js'), { './book.metadata': metadata });
const migration = require('../migrations/20261117110000-add-book-metadata');

test('create/update validators accept legacy payloads, optional nulls, and valid metadata', () => {
  assert.equal(validators.validateBookPayload({ body: { title: 'Legacy' } }), null);
  assert.equal(validators.validateBookUpdatePayload({ body: { subtitle: null, widthCm: null } }), null);
  assert.equal(validators.validateBookPayload({ body: { title: 'New', publisher: 'Publisher', widthCm: '13.50', heightCm: 20 } }), null);
});

test('API validation rejects invalid metadata types, length and dimensions', () => {
  for (const body of [
    { subtitle: [] }, { publisher: 12 }, { edition: 'x'.repeat(101) },
    { language: false }, { format: 'x'.repeat(51) }, { widthCm: 0 },
    { heightCm: -1 }, { widthCm: true }, { widthCm: [] }, { widthCm: ' ' },
    { widthCm: 0.001 }, { heightCm: 'NaN' }, { heightCm: 1000000 },
  ]) assert.ok(validators.validateBookUpdatePayload({ body }), JSON.stringify(body));
});

test('migration adds seven nullable columns atomically and can reverse them', async () => {
  const added = [];
  const removed = [];
  const transaction = { fixture: true };
  const queryInterface = {
    sequelize: { transaction: async (run) => run(transaction) },
    addColumn: async (table, name, definition, options) => {
      assert.equal(table, 'books');
      assert.equal(definition.allowNull, true);
      assert.equal(options.transaction, transaction);
      added.push(name);
    },
    removeColumn: async (table, name, options) => {
      assert.equal(table, 'books');
      assert.equal(options.transaction, transaction);
      removed.push(name);
    },
  };
  await migration.up(queryInterface, Sequelize);
  assert.deepEqual(added.sort(), ['edition', 'format', 'heightCm', 'language', 'publisher', 'subtitle', 'widthCm']);
  await migration.down(queryInterface);
  assert.deepEqual(removed.sort(), added);
});

test('model exposes the same metadata columns and decimal precision', () => {
  const sequelize = new Sequelize('unused', 'unused', 'unused', { dialect: 'postgres', logging: false });
  const Book = require('../models/book')(sequelize, DataTypes);
  for (const name of [...Object.keys(metadata.bookTextMetadataLimits), ...metadata.bookDimensionFields]) assert.ok(Book.rawAttributes[name], name);
  assert.equal(Book.rawAttributes.widthCm.type.toString(), 'DECIMAL(8,2)');
});
