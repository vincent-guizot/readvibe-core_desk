const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const axios = require('axios');
const load = require('./helpers/load-module');
const createQaApi = require('./helpers/qa-api');

const storage = () => {
  const items = new Map();
  return { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => items.set(key, String(value)), removeItem: (key) => items.delete(key) };
};

test('VibeDesk and ReadVibe production clients exchange persisted catalog, wishlist, reading and moderation data', {
  skip: process.env.RUN_CRUD_DB_TESTS !== '1', timeout: 90000,
}, async (t) => {
  const qa = await createQaApi();
  t.after(qa.close);
  const frontend = (app, file) => path.join(__dirname, `../../${app}/src`, file);
  const localStorage = storage(), sessionStorage = storage();
  const globals = { localStorage, sessionStorage, window: { dispatchEvent() {} }, Event };
  const session = load(frontend('vibedesk', 'features/auth/session.js'), {}, globals);
  const deskHttp = load(frontend('vibedesk', 'services/http.js'), {
    axios, './api-error': load(frontend('vibedesk', 'services/api-error.js')),
    '../constants/api': { API_URL: qa.baseUrl }, '../features/auth/session': session,
  }, globals).default;
  const desk = load(frontend('vibedesk', 'services/catalog-api.js'), {
    './http': deskHttp, '../constants/api': { API_URL: qa.baseUrl },
  }, { URL });
  const readerHttp = load(frontend('readvibe', 'services/http.js'), {
    axios, './api-error': load(frontend('readvibe', 'services/api-error.js')),
  }, { ...globals, process: { env: { NEXT_PUBLIC_API_URL: qa.baseUrl } } }).default;
  const reader = load(frontend('readvibe', 'services/reader.api.js'), { './http': readerHttp });
  const adminLogin = (await deskHttp.post('/api/auth/login', qa.accounts.admin)).data;
  const memberLogin = (await readerHttp.post('/api/auth/login', qa.accounts.member)).data;
  session.saveSession(adminLogin.token, adminLogin.user, true);
  localStorage.setItem('readvibe_token', memberLogin.token);
  const toolkit = require('../../readvibe/node_modules/@reduxjs/toolkit');
  const imports = { '@reduxjs/toolkit': toolkit, '../../services/http': readerHttp, '../../services/reader.api': reader };
  const reading = load(frontend('readvibe', 'redux/slices/readingSlice.js'), imports);
  const wishlist = load(frontend('readvibe', 'redux/slices/wishlistSlice.js'), imports);
  const books = load(frontend('readvibe', 'redux/slices/booksSlice.js'), imports);
  const makeStore = () => toolkit.configureStore({ reducer: {
    reading: reading.default, wishlist: wishlist.default, books: books.default,
    auth: (state = { token: memberLogin.token }) => state,
  } });
  const store = makeStore();
  let bookId, readingId;
  const author = (await desk.authorsApi.create({ pen_name: 'Cross-client author', bio: 'QA biography' })).data;
  const category = (await desk.categoriesApi.create({ name: 'Cross-client category' })).data;
  const mood = (await desk.moodsApi.create({ name: 'Cross-client mood', color: '#abcdef' })).data;
  await t.test('CMS creates a catalog book and ReadVibe loads canonical IDs and metadata', async () => {
    const created = (await desk.booksApi.create({ title: 'Cross-client book', stock: 5, page: 100, publisher: 'QA Publisher', authorId: author.id, genreId: category.id, moodIds: [mood.id] })).data;
    bookId = created.id;
    await store.dispatch(books.loadCatalog()).unwrap();
    const book = store.getState().books.items.find((item) => item.id === bookId);
    assert.equal(book.author, 'Cross-client author'); assert.equal(book.publisher, 'QA Publisher'); assert.equal(book.slug, String(bookId));
    for (const origin of ['http://localhost:3350', 'http://localhost:3355']) {
      const response = await fetch(`${qa.baseUrl}/api/books`, { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), origin);
    }
  });
  await t.test('reader wishlist appears in CMS demand analytics and disappears when reading starts', async () => {
    await store.dispatch(wishlist.addToWishlist({ bookId, priority: 'Next up', reason: 'Cross-client demand', isPublic: true })).unwrap();
    const demand = (await deskHttp.get('/api/analytics/wishlist-intelligence?period=all')).data;
    assert.equal(demand.totalDemand, 1); assert.equal(demand.rows[0].id, bookId);
    const activity = await store.dispatch(reading.startReading({ bookId })).unwrap();
    readingId = activity.id;
    assert.equal(store.getState().wishlist.items.length, 0);
    assert.equal((await deskHttp.get('/api/analytics/wishlist-intelligence?period=all')).data.totalDemand, 0);
  });
  await t.test('reading progress survives a new client store and remains private from CMS member detail', async () => {
    await store.dispatch(reading.updateProgress({ bookId, currentPage: 42, notes: 'CROSS_CLIENT_PRIVATE' })).unwrap();
    const freshStore = makeStore();
    await freshStore.dispatch(reading.loadReading()).unwrap();
    assert.equal(freshStore.getState().reading.currentReading[0].currentPage, 42);
    const member = (await deskHttp.get(`/api/members/${qa.accounts.member.id}`)).data;
    assert.equal(member.activitySummary.readingCount, 1);
    assert.ok(!JSON.stringify(member).includes('CROSS_CLIENT_PRIVATE'));
  });
  await t.test('reader review reaches CMS moderation; removal hides it publicly and retains private notes', async () => {
    await store.dispatch(reading.finishReading({ bookId, currentPage: 100, rating: 5, reviewContent: 'Cross-client public review', moods: ['Cross-client mood'] })).unwrap();
    const queue = (await deskHttp.get('/api/moderation/reviews?status=Approved')).data;
    assert.equal(queue[0].id, readingId); assert.ok(!JSON.stringify(queue).includes('CROSS_CLIENT_PRIVATE'));
    await deskHttp.patch(`/api/moderation/reviews/${readingId}`, { status: 'Removed', reason: 'QA moderation decision' });
    assert.equal((await readerHttp.get(`/api/reviews/book/${bookId}`)).data.length, 0);
    await store.dispatch(reading.loadReading()).unwrap();
    assert.equal(store.getState().reading.finishedReads[0].privateNotes, 'CROSS_CLIENT_PRIVATE');
    assert.equal((await deskHttp.get('/api/analytics/reading?period=all')).data.completed, 1);
  });
  await t.test('CMS update is visible in ReadVibe and a forged staff UI session cannot grant Member access', async () => {
    await desk.booksApi.update(bookId, { title: 'Revised cross-client book', stock: 0 });
    assert.equal((await reader.fetchCatalog())[0].title, 'Revised cross-client book');
    session.saveSession(memberLogin.token, { ...memberLogin.user, role: 'Admin' }, true);
    await assert.rejects(desk.booksApi.create({ title: 'Forbidden book' }), (error) => error.statusCode === 403);
    session.saveSession(adminLogin.token, adminLogin.user, true);
    assert.equal((await desk.booksApi.list()).data.length, 1);
  });
  await t.test('CMS deletes the fixture book and dependent reading data; taxonomies can be removed', async () => {
    await desk.booksApi.remove(bookId);
    assert.equal((await reader.fetchCatalog()).length, 0);
    await store.dispatch(reading.loadReading()).unwrap();
    assert.equal(store.getState().reading.finishedReads.length, 0);
    await desk.authorsApi.remove(author.id);
    await desk.categoriesApi.remove(category.id);
    await desk.moodsApi.remove(mood.id);
  });
});
