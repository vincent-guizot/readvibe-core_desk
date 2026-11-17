import assert from 'node:assert/strict';
import test from 'node:test';
import { configureStore } from '@reduxjs/toolkit';
import reducer, { fetchBook, saveBook, deleteBook } from '../src/features/books/booksSlice.js';
import { getBookForm, toBookPayload, validateBookForm } from '../src/features/books/book-form.js';
import { validateCoverFile, MAX_COVER_BYTES } from '../src/features/books/cover-file.js';

function createStore(booksApi) {
  return configureStore({
    reducer: { books: reducer },
    middleware: (defaults) => defaults({ thunk: { extraArgument: { booksApi } } }),
  });
}

test('detail requests use the route ID and ignore an older response', async () => {
  const resolve = {};
  const store = createStore({ getById: (id) => new Promise((done) => { resolve[id] = done; }) });
  const first = store.dispatch(fetchBook('1'));
  const second = store.dispatch(fetchBook('2'));
  assert.equal(store.getState().books.detail.loading, true);
  resolve['2']({ data: { id: 2, title: 'Second' } });
  await second;
  resolve['1']({ data: { id: 1, title: 'First' } });
  await first;
  assert.equal(store.getState().books.detail.data.id, 2);
  assert.equal(store.getState().books.detail.loading, false);
});

test('404 does not retain the previous book and supports retry', async () => {
  let fail = false;
  const store = createStore({ getById: async (id) => {
    if (fail) throw Object.assign(new Error('Buku tidak ditemukan.'), { statusCode: 404 });
    return { data: { id } };
  } });
  await store.dispatch(fetchBook('1'));
  fail = true;
  await store.dispatch(fetchBook('2'));
  assert.equal(store.getState().books.detail.data, null);
  assert.equal(store.getState().books.detail.status, 404);
  assert.equal(store.getState().books.detail.loading, false);
  fail = false;
  await store.dispatch(fetchBook('2'));
  assert.equal(store.getState().books.detail.data.id, '2');
  assert.equal(store.getState().books.detail.error, null);
});

test('save calls create or update and surfaces duplicate ISBN errors', async () => {
  const calls = [];
  const store = createStore({
    create: async (payload) => { calls.push(['create', payload]); return { data: { id: 9, ...payload } }; },
    update: async (id, payload) => { calls.push(['update', id, payload]); throw new Error('ISBN sudah digunakan.'); },
  });
  const created = await store.dispatch(saveBook({ payload: { title: 'New' } }));
  assert.equal(created.payload.id, 9);
  assert.equal(store.getState().books.save.loading, false);
  await store.dispatch(saveBook({ id: 9, payload: { isbn: 'duplicate' } }));
  assert.deepEqual(calls[1], ['update', 9, { isbn: 'duplicate' }]);
  assert.equal(store.getState().books.save.error, 'ISBN sudah digunakan.');
});

test('duplicate submissions do not issue a second create request', async () => {
  let calls = 0;
  let finish;
  const store = createStore({ create: () => { calls++; return new Promise((resolve) => { finish = resolve; }); } });
  const first = store.dispatch(saveBook({ payload: { title: 'New' } }));
  const duplicate = await store.dispatch(saveBook({ payload: { title: 'New' } }));
  assert.equal(duplicate.meta.condition, true);
  assert.equal(calls, 1);
  finish({ data: { id: 1 } });
  await first;
});

test('delete failure remains visible and can be retried successfully', async () => {
  let fail = true;
  const store = createStore({ remove: async () => { if (fail) throw new Error('Penghapusan ditolak.'); } });
  await store.dispatch(deleteBook(7));
  assert.deepEqual(store.getState().books.remove, { loading: false, error: 'Penghapusan ditolak.' });
  fail = false;
  const result = await store.dispatch(deleteBook(7));
  assert.equal(result.payload, 7);
  assert.deepEqual(store.getState().books.remove, { loading: false, error: null });
});

test('form validation rejects missing fields, unsafe cover URLs and invalid numbers', () => {
  const errors = validateBookForm({ ...getBookForm(), title: ' ', stock: -1, price: 0.5, year: 'invalid', page: 1.2, image: 'javascript:alert(1)' });
  for (const field of ['title', 'authorId', 'genreId', 'stock', 'price', 'year', 'page', 'image']) assert.ok(errors[field], field);
});

test('edit payload preserves zero values and mood relations; optional numbers can be cleared', () => {
  const form = getBookForm({ title: ' Title ', authorId: 1, genreId: 2, stock: 0, price: 0, year: 2020, page: 12, moods: [{ id: 3 }] });
  form.year = '';
  form.page = '';
  assert.deepEqual(validateBookForm(form), {});
  assert.deepEqual(toBookPayload(form), {
    subtitle: null, publisher: null, edition: null, language: null, format: null, widthCm: null, heightCm: null,
    title: 'Title', isbn: '', authorId: 1, genreId: 2, year: null, page: null,
    stock: 0, price: 0, description: '', image: '', moodIds: [3],
  });
});

test('metadata round-trips API decimal strings and can be cleared', () => {
  const form = getBookForm({ title: 'Book', authorId: 1, genreId: 2, subtitle: ' Novel ', publisher: ' Publisher ', edition: 'First', language: 'Bahasa Indonesia', format: 'Hardcover', widthCm: '13.50', heightCm: '20.00' });
  assert.deepEqual(validateBookForm(form), {});
  assert.equal(toBookPayload(form).widthCm, 13.5);
  assert.equal(toBookPayload(form).publisher, 'Publisher');
  form.subtitle = '';
  form.widthCm = '';
  assert.equal(toBookPayload(form).subtitle, null);
  assert.equal(toBookPayload(form).widthCm, null);
});

test('metadata validation matches text limits and positive two-decimal dimensions', () => {
  const form = getBookForm({ title: 'Book', authorId: 1, genreId: 2 });
  for (const value of [0, -1, ' ', 13.555, 1000000, 'invalid']) {
    assert.ok(validateBookForm({ ...form, widthCm: value }).widthCm, String(value));
  }
  assert.ok(validateBookForm({ ...form, publisher: 'x'.repeat(256) }).publisher);
});

test('cover selection accepts JPG/PNG/WebP within limit and rejects invalid files', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.equal(validateCoverFile({ type, size: MAX_COVER_BYTES }), null);
  for (const file of [null, { type: 'image/svg+xml', size: 100 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: MAX_COVER_BYTES + 1 }]) assert.ok(validateCoverFile(file));
});

test('saving a selected cover uploads first and persists the returned image URL', async () => {
  const calls = [];
  const file = { name: 'cover.png' };
  const url = 'https://api.example.test/api/books/covers/test.webp';
  const store = createStore({
    uploadCover: async (selected) => { calls.push(['upload', selected]); return { data: { url } }; },
    update: async (id, payload) => { calls.push(['update', id, payload]); return { data: { id, ...payload } }; },
  });
  const result = await store.dispatch(saveBook({ id: 1, payload: { title: 'Book', image: 'old' }, coverFile: file }));
  assert.equal(result.payload.image, url);
  assert.equal(calls[0][0], 'upload');
  assert.deepEqual(calls[1], ['update', 1, { title: 'Book', image: url }]);
});

test('upload failure stops book persistence and surfaces a retryable error', async () => {
  let creates = 0;
  const store = createStore({
    uploadCover: async () => { throw new Error('Upload gagal.'); },
    create: async () => { creates++; },
  });
  await store.dispatch(saveBook({ payload: { title: 'Book' }, coverFile: { name: 'cover.png' } }));
  assert.equal(creates, 0);
  assert.equal(store.getState().books.save.loading, false);
  assert.equal(store.getState().books.save.error, 'Upload gagal.');
  assert.equal(store.getState().books.save.uploadedCoverUrl, null);
});

test('book-save failure preserves uploaded URL for a retry without a duplicate upload', async () => {
  let uploads = 0;
  let fail = true;
  const url = 'https://api.example.test/api/books/covers/test.webp';
  const store = createStore({
    uploadCover: async () => { uploads++; return { data: { url } }; },
    create: async (payload) => { if (fail) throw new Error('ISBN sudah digunakan.'); return { data: { id: 1, ...payload } }; },
  });
  const args = { payload: { title: 'Book' }, coverFile: { name: 'cover.png' } };
  await store.dispatch(saveBook(args));
  const uploadedCoverUrl = store.getState().books.save.uploadedCoverUrl;
  assert.equal(uploadedCoverUrl, url);
  fail = false;
  const result = await store.dispatch(saveBook({ ...args, uploadedCoverUrl }));
  assert.equal(uploads, 1);
  assert.equal(result.payload.image, url);
});
