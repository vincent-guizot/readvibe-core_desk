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
    ['reading title length', 'PATCH', `/reading/${activity.id}`, { reviewTitle: 'x'.repeat(256) }, 400],
    ['reading title type', 'PATCH', `/reading/${activity.id}`, { reviewTitle: {} }, 400],
    ['reading review visibility', 'PATCH', `/reading/${activity.id}`, { reviewVisibility: 'Secret' }, 400],
    ['finish rating type', 'POST', '/reading/finish', { bookId: book.id, rating: [] }, 400],
    ['wishlist priority', 'PUT', `/wishlists/${wish.id}`, { priority: 'Urgent' }, 400],
    ['wishlist visibility', 'PUT', `/wishlists/${wish.id}`, { visibility: 'Secret' }, 400],
    ['wishlist reason type', 'PUT', `/wishlists/${wish.id}`, { reason: {} }, 400],
    ['wishlist missing book', 'POST', '/wishlists', { bookId: 2147483647 }, 404],
    ['review text type', 'POST', '/reviews', { bookId: book.id, publicReview: 12 }, 400],
    ['review rating', 'POST', '/reviews', { bookId: book.id, publicReview: 'Review', rating: 99 }, 400],
    ['review title length', 'POST', '/reviews', { bookId: book.id, publicReview: 'Review', reviewTitle: 'x'.repeat(256) }, 400],
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
  await t.test('review title persists, clearing public review hides it without changing private notes', async () => {
    const result = await request('PATCH', `/reading/${activity.id}`, { reviewTitle: 'Saved title', publicReview: 'Public text', privateNote: 'Private text' }, member);
    assert.equal(result.status, 200);
    assert.equal(result.body.data.reviewTitle, 'Saved title');
    let publicResult = await request('GET', `/reviews/book/${book.id}`);
    assert.equal(publicResult.body.data[0].reviewTitle, 'Saved title');
    assert.ok(!JSON.stringify(publicResult.body).includes('Private text'));
    await request('PATCH', `/reading/${activity.id}`, { publicReview: '' }, member);
    publicResult = await request('GET', `/reviews/book/${book.id}`);
    assert.equal(publicResult.body.data.length, 0);
    const persisted = await qa.db.reading_activity.findByPk(activity.id);
    assert.equal(persisted.privateNote, 'Private text');
    assert.equal(persisted.reviewTitle, 'Saved title');
  });
  await t.test('private review text survives hide and republish without leaking to public or staff projections', async () => {
    const result = await request('PATCH', `/reading/${activity.id}`, { status: 'Finished', publicReview: 'PRIVATE_REVIEW_DRAFT', reviewTitle: 'PRIVATE_REVIEW_TITLE', reviewVisibility: 'Private' }, member);
    assert.equal(result.status, 200);
    for (const [route, token] of [[`/reviews/book/${book.id}`], [`/books/${book.id}`], [`/reading/user/${qa.accounts.member.id}/finished`], ['/moderation/reviews?status=', admin]]) {
      const response = await request('GET', route, undefined, token);
      assert.equal(response.status, 200);
      assert.ok(!JSON.stringify(response.body).includes('PRIVATE_REVIEW_DRAFT'), route);
      assert.ok(!JSON.stringify(response.body).includes('PRIVATE_REVIEW_TITLE'), route);
    }
    assert.equal((await request('GET', `/moderation/reviews/${activity.id}`, undefined, admin)).status, 404);
    assert.equal((await request('PATCH', `/moderation/reviews/${activity.id}`, { status: 'Rejected', reason: 'Cannot moderate a private draft' }, admin)).status, 404);
    assert.equal((await request('POST', `/reviews/${activity.id}/report`, { reason: 'Cannot report a private draft' }, member)).status, 404);
    const own = await request('GET', '/reading', undefined, member);
    assert.equal(own.body.data[0].publicReview, 'PRIVATE_REVIEW_DRAFT');
    assert.equal(own.body.data[0].privateNote, 'Private text');
    await request('PATCH', `/reading/${activity.id}`, { reviewVisibility: 'Public' }, member);
    const republished = await request('GET', `/reviews/book/${book.id}`);
    assert.equal(republished.body.data[0].publicReview, 'PRIVATE_REVIEW_DRAFT');
    assert.equal(republished.body.data[0].reviewTitle, 'PRIVATE_REVIEW_TITLE');
    await request('PATCH', `/reading/${activity.id}`, { reviewVisibility: 'Private' }, member);
    assert.equal((await request('POST', '/reviews', { bookId: book.id, publicReview: 'New explicitly public review' }, member)).status, 201);
    const replaced = await request('GET', `/reviews/book/${book.id}`);
    assert.equal(replaced.body.data[0].reviewTitle, '');
    assert.equal((await qa.db.reading_activity.findByPk(activity.id)).privateNote, 'Private text');
  });
});
