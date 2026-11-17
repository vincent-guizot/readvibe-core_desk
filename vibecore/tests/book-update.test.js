const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const loadModule = require('./helpers/load-module');

// Isolate persistence so this regression check never touches a developer database.
function loadService(book) {
  const filename = path.join(__dirname, '../src/modules/books/book.service.js');
  const models = {
    book: {
      findByPk: async () => book,
      create: async (payload) => { Object.assign(book, payload); return book; },
    },
    book_mood: { destroy: async () => {}, create: async () => {} },
  };
  const mocks = {
    sequelize: require('sequelize'),
    './book.metadata': loadModule(path.join(__dirname, '../src/modules/books/book.metadata.js')),
    '../../../models': models,
    '../../errors/app-error': { AppError: { notFound: (message) => new Error(message) } },
    '../../contracts/error-codes': { ErrorCodes: {} },
    '../../utils/pagination': { buildPaginationMeta: () => ({}) },
  };
  const exports = loadModule(filename, mocks);
  exports.BookService.getById = async () => book;
  return exports.BookService;
}

test('clearing optional year and page persists null rather than NaN', async () => {
  const book = { id: 1, year: 2020, page: 200, stock: 0, update: async function (payload) { Object.assign(this, payload); } };
  const service = loadService(book);
  await service.update(1, { year: null, page: null });
  assert.equal(book.year, null);
  assert.equal(book.page, null);
  assert.equal(book.stock, 0);
  assert.equal(book.status, 'Out of Stock');
});

test('omitted year and page preserve existing values', async () => {
  const book = { id: 1, year: 2020, page: 200, stock: 2, update: async function (payload) { Object.assign(this, payload); } };
  const service = loadService(book);
  await service.update(1, { title: 'Updated' });
  assert.equal(book.year, 2020);
  assert.equal(book.page, 200);
  assert.equal(book.status, 'Available');
});

test('create persists normalized metadata while older payloads remain supported', async () => {
  const book = { id: 3 };
  const service = loadService(book);
  await service.create({ title: 'New', subtitle: ' A novel ', publisher: ' Publisher ', edition: '', language: ' English ', format: 'Paperback', widthCm: '13.50', heightCm: 20 }, 1);
  assert.equal(book.subtitle, 'A novel');
  assert.equal(book.publisher, 'Publisher');
  assert.equal(book.edition, null);
  assert.equal(book.language, 'English');
  assert.equal(book.widthCm, 13.5);
  assert.equal(book.heightCm, 20);
  await service.create({ title: 'Legacy payload' }, 1);
  assert.equal(book.title, 'Legacy payload');
});

test('partial metadata update preserves omitted fields and supports clearing', async () => {
  const book = { id: 1, subtitle: 'Old', publisher: 'Keep', widthCm: '13.50', heightCm: '20.00', update: async function (payload) { Object.assign(this, payload); } };
  const service = loadService(book);
  await service.update(1, { subtitle: ' Updated ', widthCm: null, format: '' });
  assert.equal(book.subtitle, 'Updated');
  assert.equal(book.publisher, 'Keep');
  assert.equal(book.widthCm, null);
  assert.equal(book.heightCm, '20.00');
  assert.equal(book.format, null);
});
