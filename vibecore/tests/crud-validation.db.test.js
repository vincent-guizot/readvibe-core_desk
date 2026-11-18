const test = require('node:test');
const assert = require('node:assert/strict');
const createQaApi = require('./helpers/qa-api');

test('CRUD boundaries reject invalid values before persistence', { skip: process.env.RUN_CRUD_DB_TESTS !== '1', timeout: 90000 }, async (t) => {
  const qa = await createQaApi();
  t.after(qa.close);
  const request = async (method, suffix, body, token) => {
    const response = await fetch(`${qa.baseUrl}/api${suffix}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };
  const admin = (await request('POST', '/auth/login', qa.accounts.admin)).body.data.token;
  const member = (await request('POST', '/auth/login', qa.accounts.member)).body.data.token;
  const book = (await request('POST', '/books', { title: 'Validation book', page: 100 }, admin)).body.data;
  const activity = (await request('POST', '/reading/start', { bookId: book.id }, member)).body.data;
  const wish = (await request('POST', '/wishlists', { bookId: book.id, visibility: 'Private' }, member)).body.data;
  const cases = [
    ['reading status', 'PATCH', `/reading/${activity.id}`, { status: 'Invalid' }, 400],
    ['reading rating', 'PATCH', `/reading/${activity.id}`, { rating: 99 }, 400],
    ['finish rating type', 'POST', '/reading/finish', { bookId: book.id, rating: [] }, 400],
    ['wishlist priority', 'PUT', `/wishlists/${wish.id}`, { priority: 'Urgent' }, 400],
    ['wishlist visibility', 'PUT', `/wishlists/${wish.id}`, { visibility: 'Secret' }, 400],
    ['wishlist reason type', 'PUT', `/wishlists/${wish.id}`, { reason: {} }, 400],
    ['wishlist missing book', 'POST', '/wishlists', { bookId: 2147483647 }, 404],
    ['review text type', 'POST', '/reviews', { bookId: book.id, publicReview: 12 }, 400],
    ['review rating', 'POST', '/reviews', { bookId: book.id, publicReview: 'Review', rating: 99 }, 400],
    ['review missing book', 'POST', '/reviews', { bookId: 2147483647, publicReview: 'Review' }, 404],
  ];
  for (const [name, method, url, body, expected] of cases) await t.test(name, async () => {
    const result = await request(method, url, body, member);
    assert.equal(result.status, expected, `${name}: ${JSON.stringify(result.body)}`);
    assert.equal(result.body.success, false);
  });
  assert.equal((await qa.db.reading_activity.findByPk(activity.id)).status, 'Reading');
  assert.equal((await qa.db.reading_activity.findByPk(activity.id)).rating, null);
  assert.equal((await qa.db.wishlist.findByPk(wish.id)).visibility, 'Private');
});
