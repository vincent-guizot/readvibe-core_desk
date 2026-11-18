const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = require('./helpers/load-module');
const toolkit = require('../../readvibe/node_modules/@reduxjs/toolkit');
const frontend = (file) => path.join(__dirname, '../../readvibe/src', file);

function loadReader(http) {
  const api = load(frontend('services/reader.api.js'), { './http': http });
  const imports = { '@reduxjs/toolkit': toolkit, '../../services/http': http, '../../services/reader.api': api };
  const reading = load(frontend('redux/slices/readingSlice.js'), imports);
  const wishlist = load(frontend('redux/slices/wishlistSlice.js'), imports);
  const books = load(frontend('redux/slices/booksSlice.js'), imports);
  const store = toolkit.configureStore({ reducer: {
    reading: reading.default, wishlist: wishlist.default, books: books.default,
    auth: (state = { token: 'fixture-session' }, action) => action.type === 'auth/logout' ? { token: null } : state,
  } });
  return { api, reading, wishlist, books, store };
}

test('ReadVibe loads the whole paginated catalog, maps canonical IDs, and translates wishlist priorities', async () => {
  const pages = [];
  const { store, books, api } = loadReader({ get: async (url, { params }) => {
    assert.equal(url, '/api/books'); pages.push(params.page);
    return { data: [{ id: params.page, author: { pen_name: 'Writer' }, genre: { name: 'Fiction' }, moods: [{ name: 'Calm' }], page: 120 }], meta: { pagination: { hasNextPage: params.page === 1 } } };
  } });
  await store.dispatch(books.loadCatalog());
  assert.deepEqual(pages, [1, 2]);
  const book = store.getState().books.items[1];
  assert.equal(book.id, 2); assert.equal(book.slug, '2'); assert.equal(book.author, 'Writer'); assert.equal(book.pages, 120);
  assert.equal(api.wishlistPayload({ priority: 'Next up', isPublic: false }).priority, 'High');
  assert.equal(api.wishlistPayload({ priority: 'Someday', isPublic: false }).visibility, 'Private');
  assert.equal(api.mapWishlist({ priority: 'Medium' }).priority, 'Soon');
});

test('ReadVibe saves server activity IDs, persists page zero, reloads empty shelves, and preserves state on API failure', async () => {
  let activity = { id: 87, bookId: 2, status: 'Reading', currentPage: 21, book: { id: 2, page: 100 } };
  let fail = false;
  const { store, reading } = loadReader({
    get: async () => ({ data: activity ? [activity] : [] }),
    patch: async (url, body) => {
      assert.equal(url, '/api/reading/87');
      if (fail) throw new Error('Server unavailable');
      activity = { ...activity, ...body }; return { data: activity };
    },
  });
  await store.dispatch(reading.loadReading());
  assert.equal(store.getState().reading.currentReading[0].id, 87);
  await store.dispatch(reading.updateProgress({ bookId: '2', currentPage: 0 }));
  assert.equal(activity.currentPage, 0);
  assert.equal(store.getState().reading.currentReading[0].currentPage, 0);
  fail = true;
  assert.ok((await store.dispatch(reading.updateProgress({ bookId: 2, currentPage: 80 }))).error);
  assert.equal(store.getState().reading.currentReading[0].currentPage, 0);
  assert.equal(store.getState().reading.error, 'Server unavailable');
  activity = null;
  await store.dispatch(reading.loadReading());
  assert.equal(store.getState().reading.currentReading.length, 0);
});

test('ReadVibe ignores a late private response after logout and rejects anonymous mutations', async () => {
  let resolve;
  let mutations = 0;
  const { store, reading } = loadReader({
    get: () => new Promise((done) => { resolve = done; }),
    post: async () => { mutations++; },
  });
  const pending = store.dispatch(reading.loadReading());
  store.dispatch({ type: 'auth/logout' });
  resolve({ data: [{ id: 87, bookId: 2, status: 'Reading', privateNote: 'Private' }] });
  assert.ok((await pending).error);
  assert.equal(store.getState().reading.currentReading.length, 0);
  assert.ok((await store.dispatch(reading.startReading({ bookId: 2 }))).error);
  assert.equal(mutations, 0);
});
