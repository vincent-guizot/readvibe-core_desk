const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = require('./helpers/load-module');
const toolkit = require('../../readvibe/node_modules/@reduxjs/toolkit');
const frontend = (file) => path.join(__dirname, '../../readvibe/src', file);

function loadReader(http, globals = {}) {
  const api = load(frontend('services/reader.api.js'), { './http': http });
  const imports = { '@reduxjs/toolkit': toolkit, '../../services/http': http, '../../services/reader.api': api };
  const reading = load(frontend('redux/slices/readingSlice.js'), imports);
  const wishlist = load(frontend('redux/slices/wishlistSlice.js'), imports);
  const books = load(frontend('redux/slices/booksSlice.js'), imports);
  const ui = load(frontend('redux/slices/uiSlice.js'), { '@reduxjs/toolkit': toolkit }, globals);
  const auth = load(frontend('redux/slices/authSlice.js'), {
    '@reduxjs/toolkit': toolkit,
    '../../constants': { STORAGE_KEYS: { TOKEN: 'readvibe_token', USER: 'readvibe_user' } },
  }, globals);
  const store = toolkit.configureStore({ reducer: {
    reading: reading.default, wishlist: wishlist.default, books: books.default,
    auth: auth.default, ui: ui.default,
  } });
  store.dispatch(auth.setCredentials({ user: { id: 1, username: 'reader-a' }, token: 'fixture-session' }));
  return { api, reading, wishlist, books, store, auth, ui };
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

test('catalog loading deduplicates concurrent requests and clears a recovered error', async () => {
  let calls = 0;
  let resolve;
  let fail = true;
  const { store, books } = loadReader({ get: async () => {
    calls++;
    if (fail) throw new Error('Catalog offline');
    return new Promise((done) => { resolve = done; });
  } });
  await store.dispatch(books.loadCatalog());
  assert.equal(store.getState().books.error, 'Catalog offline');
  fail = false;
  const pending = store.dispatch(books.loadCatalog());
  await store.dispatch(books.loadCatalog());
  assert.equal(calls, 2);
  resolve({ data: [], meta: { pagination: { hasNextPage: false } } });
  await pending;
  assert.equal(store.getState().books.status, 'succeeded');
  assert.equal(store.getState().books.error, null);
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

function loadNotifications(saved = new Map()) {
  const localStorage = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value),
  };
  const ui = load(frontend('redux/slices/uiSlice.js'), { '@reduxjs/toolkit': toolkit }, { window: {}, localStorage });
  const store = toolkit.configureStore({ reducer: { ui: ui.default } });
  const signIn = (id, token = `token-${id}`) => store.dispatch({ type: 'auth/setCredentials', payload: { user: { id }, token } });
  return { ui, store, saved, signIn };
}

test('notifications stay private across logout, account switching, reload and token refresh', () => {
  const { ui, store, saved, signIn } = loadNotifications(new Map([
    ['readvibe_notifications', JSON.stringify([{ id: 'legacy', title: 'Unknown account' }])],
  ]));
  assert.equal(store.getState().ui.notifications.length, 0, 'guest must not restore legacy private notifications');
  signIn(1);
  store.dispatch(ui.addNotification({ id: 'private-a', title: 'Reader A book' }));
  store.dispatch(ui.markNotificationRead('private-a'));
  store.dispatch({ type: 'auth/logout' });
  assert.equal(store.getState().ui.notifications.length, 0);
  store.dispatch(ui.addNotification({ title: 'Guest event' }));
  assert.equal(store.getState().ui.notifications.length, 0);
  signIn(2);
  assert.ok(!store.getState().ui.notifications.some((item) => item.id === 'private-a' || item.id === 'legacy'));
  store.dispatch(ui.addNotification({ id: 'private-b', title: 'Reader B book' }));
  signIn(1);
  assert.equal(store.getState().ui.notifications.find((item) => item.id === 'private-a').read, true);
  assert.ok(!store.getState().ui.notifications.some((item) => item.id === 'private-b'));
  store.dispatch(ui.addNotification({ id: 'before-refresh', title: 'Recent event' }));
  signIn('1', 'refreshed-token-1');
  assert.ok(store.getState().ui.notifications.some((item) => item.id === 'before-refresh'));
  const reloaded = loadNotifications(saved);
  assert.equal(reloaded.store.getState().ui.notifications.length, 0);
  reloaded.signIn(2);
  assert.ok(reloaded.store.getState().ui.notifications.some((item) => item.id === 'private-b'));
  assert.ok(!reloaded.store.getState().ui.notifications.some((item) => item.id === 'private-a'));
});

test('cleared notifications stay empty after signing in again and storage errors do not block actions', () => {
  const { ui, store, saved, signIn } = loadNotifications();
  signIn(1);
  store.dispatch(ui.clearAllNotifications());
  store.dispatch({ type: 'auth/logout' });
  signIn(1);
  assert.equal(store.getState().ui.notifications.length, 0, 'clearing must not seed another welcome notification');
  const reloaded = loadNotifications(saved);
  reloaded.signIn(1);
  assert.equal(reloaded.store.getState().ui.notifications.length, 0);
  const brokenStorage = { getItem() { throw new Error('Storage disabled'); }, setItem() { throw new Error('Storage disabled'); } };
  const unavailable = load(frontend('redux/slices/uiSlice.js'), { '@reduxjs/toolkit': toolkit }, { window: {}, localStorage: brokenStorage });
  let state = unavailable.default(undefined, { type: 'auth/setCredentials', payload: { user: { id: 9 }, token: 'token' } });
  state = unavailable.default(state, unavailable.addNotification({ id: 'in-memory', title: 'Saved in memory' }));
  assert.ok(state.notifications.some((item) => item.id === 'in-memory'));
});

test('wishlist, reading progress and completion notifications persist only for the active account', async () => {
  const saved = new Map();
  const localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: (key) => saved.delete(key) };
  const book = { id: 2, title: 'A real API book', page: 100 };
  let activity;
  const { store, reading, wishlist, auth } = loadReader({
    post: async (url, body) => {
      if (url === '/api/wishlists') return { data: { id: 9, ...body, book } };
      activity = { id: 87, bookId: 2, book, status: url.endsWith('/finish') ? 'Finished' : 'Reading', ...body };
      return { data: activity };
    },
    patch: async (url, body) => ({ data: activity = { ...activity, ...body } }),
  }, { window: {}, localStorage });
  await store.dispatch(wishlist.addToWishlist({ bookId: 2, priority: 'Soon' }));
  await store.dispatch(reading.startReading({ bookId: 2 }));
  await store.dispatch(reading.updateProgress({ bookId: 2, currentPage: 50 }));
  await store.dispatch(reading.updateProgress({ bookId: 2, currentPage: 60 }));
  await store.dispatch(reading.finishReading({ bookId: 2, favoriteQuote: 'Kept quote' }));
  assert.equal(store.getState().ui.notifications.length, 5, 'welcome, wishlist, start, halfway once, and finish');
  assert.equal(store.getState().ui.notifications.filter((item) => item.id === 'milestone-50-2').length, 1);
  assert.equal(store.getState().reading.finishedReads[0].favoriteQuote, 'Kept quote');
  assert.equal(store.getState().ui.notifications[0].link, '/vibe-card?bookId=2');
  assert.equal(JSON.parse(saved.get('readvibe_notifications:1')).length, 5);
  store.dispatch(auth.logout());
  store.dispatch(auth.setCredentials({ user: { id: 2 }, token: 'other-session' }));
  assert.equal(store.getState().ui.notifications.length, 1);
  assert.ok(!JSON.stringify(store.getState().ui.notifications).includes('A real API book'));
});

test('late reading, profile and review responses cannot notify a different account', async () => {
  let finishReadingRequest;
  let finishProfileRequest;
  let finishReviewRequest;
  const http = {
    post: (url) => new Promise((resolve) => { if (url === '/api/reviews') finishReviewRequest = resolve; else finishReadingRequest = resolve; }),
    put: () => new Promise((resolve) => { finishProfileRequest = resolve; }),
  };
  const { store, reading, wishlist, api, auth, ui } = loadReader(http);
  const facade = load(frontend('lib/store.js'), {
    '../redux/store': { store },
    '../redux/slices/readingSlice': reading,
    '../redux/slices/wishlistSlice': wishlist,
    '../redux/slices/authSlice': auth,
    '../redux/slices/uiSlice': ui,
    '../services/http': http,
    '../services/reader.api': api,
  }).readVibeStore;
  const pendingReading = store.dispatch(reading.startReading({ bookId: 2 }));
  const pendingProfile = assert.rejects(facade.updateUser({ name: 'Old reader name' }), /Sesi berubah/);
  const pendingReview = assert.rejects(facade.addReview({ bookId: 2, rating: 4, content: 'Old reader review' }), /Sesi berubah/);
  store.dispatch(auth.logout());
  store.dispatch(auth.setCredentials({ user: { id: 2, username: 'reader-b' }, token: 'other-session' }));
  finishReadingRequest({ data: { id: 87, bookId: 2, status: 'Reading', book: { id: 2, title: 'Private old book' } } });
  finishProfileRequest({ data: { profile: { fullname: 'Old reader name' } } });
  finishReviewRequest({ data: { id: 10 } });
  assert.ok((await pendingReading).error);
  await Promise.all([pendingProfile, pendingReview]);
  assert.equal(store.getState().auth.user.username, 'reader-b');
  assert.equal(store.getState().ui.notifications.length, 0);
  store.dispatch(ui.addNotification({ id: 'b', title: 'Current account' }));
  facade.markNotificationAsRead('b');
  assert.equal(facade.getNotifications()[0].read, true);
  facade.deleteNotification('b');
  assert.equal(facade.getNotifications().length, 0);
});
