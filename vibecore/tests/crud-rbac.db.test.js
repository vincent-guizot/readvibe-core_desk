const test = require('node:test');
const assert = require('node:assert/strict');
const createQaApi = require('./helpers/qa-api');

test('real API CRUD, RBAC, ownership and public projections on a disposable PostgreSQL database', {
  skip: process.env.RUN_CRUD_DB_TESTS !== '1', timeout: 120000,
}, async (t) => {
  const qa = await createQaApi();
  t.after(qa.close);
  const tokens = {};
  let requests = 0;
  const api = async (method, url, role, body, expected = 200) => {
    requests++;
    const response = await fetch(`${qa.baseUrl}/api${url}`, {
      method, headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${tokens[role]}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const envelope = await response.json();
    assert.equal(response.status, expected, `${method} ${url} as ${role || 'anonymous'}: ${JSON.stringify(envelope)}`);
    assert.equal(envelope.success, expected < 400);
    for (const key of ['message', 'data', 'meta', 'error', 'requestId']) assert.ok(Object.hasOwn(envelope, key), `${url}: ${key}`);
    if (expected >= 400) { assert.equal(envelope.data, null); assert.ok(envelope.error.code); }
    return envelope.data;
  };
  for (const [role, user] of Object.entries(qa.accounts)) {
    const session = await api('POST', '/auth/login', null, { email: user.email, password: user.password });
    tokens[role] = session.token;
  }
  const deny = async (method, url, body, allowed) => {
    for (const role of [null, 'member', 'librarian', 'admin']) {
      if (!allowed.includes(role)) await api(method, url, role, body, role ? 403 : 401);
    }
  };
  const ids = {};
  for (const [resource, create, update, nameField] of [
    ['authors', { pen_name: 'QA Author', bio: 'Original bio' }, { pen_name: 'QA Revised', bio: 'Revised bio' }, 'pen_name'],
    ['categories', { name: 'QA Category', description: 'Original category' }, { name: 'QA Revised Category', description: 'Revised' }, 'name'],
    ['moods', { name: 'QA Mood', color: '#abcdef', description: 'Original mood' }, { name: 'QA Revised Mood', color: '#123456' }, 'name'],
  ]) {
    await t.test(`${resource}: Admin/Librarian CRUD, public reads, rejected Member/anonymous writes`, async () => {
      for (const role of ['admin', 'librarian']) {
        const data = { ...create, [nameField]: `${create[nameField]} ${role}` };
        const created = await api('POST', `/${resource}`, role, data, 201);
        assert.equal(created[nameField], data[nameField]);
        await deny('POST', `/${resource}`, data, ['admin', 'librarian']);
        await deny('PUT', `/${resource}/${created.id}`, update, ['admin', 'librarian']);
        await deny('DELETE', `/${resource}/${created.id}`, undefined, ['admin', 'librarian']);
        for (const reader of [null, 'member', 'librarian', 'admin']) {
          assert.ok((await api('GET', `/${resource}`, reader)).some((row) => row.id === created.id));
          assert.equal((await api('GET', `/${resource}/${created.id}`, reader)).id, created.id);
        }
        const updated = await api('PUT', `/${resource}/${created.id}`, role, { ...update, [nameField]: `${update[nameField]} ${role}` });
        assert.equal((await api('GET', `/${resource}/${created.id}`, null))[nameField], updated[nameField]);
        await api('DELETE', `/${resource}/${created.id}`, role);
        await api('GET', `/${resource}/${created.id}`, null, undefined, 404);
      }
      ids[resource] = (await api('POST', `/${resource}`, 'admin', create, 201)).id;
      await api('POST', `/${resource}`, 'admin', {}, 400);
    });
  }
  const bookBody = { title: 'QA Book', authorId: ids.authors, genreId: ids.categories, moodIds: [ids.moods], stock: 9, page: 100, isbn: 'qa-isbn', publisher: 'QA Publisher' };
  let bookId, pickId, readingId;
  await t.test('books: both staff roles CRUD, relations, duplicate ISBN, validation and reference protection', async () => {
    for (const role of ['admin', 'librarian']) {
      const book = await api('POST', '/books', role, { ...bookBody, isbn: `${bookBody.isbn}-${role}` }, 201);
      await deny('POST', '/books', bookBody, ['admin', 'librarian']);
      await deny('PUT', `/books/${book.id}`, { title: 'Denied' }, ['admin', 'librarian']);
      await deny('DELETE', `/books/${book.id}`, undefined, ['admin', 'librarian']);
      for (const reader of [null, 'member', 'librarian', 'admin']) {
        assert.equal((await api('GET', `/books/${book.id}`, reader)).author.id, ids.authors);
        assert.ok((await api('GET', '/books?search=QA&limit=100', reader)).some((row) => row.id === book.id));
      }
      await api('POST', '/books', role, { ...bookBody, isbn: `${bookBody.isbn}-${role}` }, 409);
      await api('PUT', `/books/${book.id}`, role, { stock: -1 }, 400);
      await api('PUT', `/books/${book.id}`, role, { title: 'Revised QA Book', stock: 0, publisher: null });
      const updated = await api('GET', `/books/${book.id}`, null);
      assert.equal(updated.stock, 0); assert.equal(updated.publisher, null); assert.equal(updated.status, 'Out of Stock');
      for (const resource of ['authors', 'categories', 'moods']) await api('DELETE', `/${resource}/${ids[resource]}`, role, undefined, 409);
      await api('DELETE', `/books/${book.id}`, role);
      await api('GET', `/books/${book.id}`, null, undefined, 404);
    }
    bookId = (await api('POST', '/books', 'admin', bookBody, 201)).id;
  });
  await t.test('editorial: both staff roles create/list/update/delete and public reads', async () => {
    for (const role of ['admin', 'librarian']) {
      const body = { bookId, tagline: 'QA Pick', curationWeight: 70, isActive: true };
      const created = await api('POST', '/editorial', role, body, 201);
      await deny('POST', '/editorial', body, ['admin', 'librarian']);
      await deny('PUT', `/editorial/${created.id}`, { tagline: 'Denied' }, ['admin', 'librarian']);
      await deny('DELETE', `/editorial/${created.id}`, undefined, ['admin', 'librarian']);
      for (const reader of [null, 'member', 'librarian', 'admin']) assert.ok((await api('GET', '/editorial', reader)).some((row) => row.id === created.id));
      await api('PUT', `/editorial/${created.id}`, role, { tagline: 'Revised pick', curationWeight: 80 });
      assert.equal((await api('GET', '/editorial', null)).find((row) => row.id === created.id).tagline, 'Revised pick');
      await api('DELETE', `/editorial/${created.id}`, role);
    }
    pickId = (await api('POST', '/editorial', 'librarian', { bookId, tagline: 'Persistent QA pick', curationWeight: 75 }, 201)).id;
  });
  await t.test('wishlist and reading: all authenticated roles own CRUD, other-user rejection and private-field isolation', async () => {
    for (const role of ['member', 'librarian', 'admin']) {
      const owner = qa.accounts[role];
      const wish = await api('POST', '/wishlists', role, { bookId, visibility: 'Private', priority: 'High', reason: 'Private wishlist' }, 201);
      assert.ok((await api('GET', '/wishlists', role)).some((row) => row.id === wish.id));
      await api('PUT', `/wishlists/${wish.id}`, 'other', { reason: 'Denied' }, 404);
      await api('DELETE', `/wishlists/${wish.id}`, 'other', undefined, 404);
      assert.equal((await api('GET', `/wishlists/username/${owner.username}`, null)).items.length, 0);
      await api('PUT', `/wishlists/${wish.id}`, role, { visibility: 'Public', reason: 'Public reason' });
      assert.equal((await api('GET', `/wishlists/user/${owner.id}`, null)).items[0].reason, 'Public reason');
      await api('DELETE', `/wishlists/${wish.id}`, role);
      assert.equal((await api('GET', '/wishlists', role)).length, 0);
      await api('POST', '/wishlists', role, { bookId }, 201);
      const reading = await api('POST', '/reading/start', role, { bookId, currentPage: 0 }, 201);
      assert.equal((await api('GET', '/wishlists', role)).length, 0);
      assert.equal((await api('GET', '/reading', role))[0].id, reading.id);
      await api('PATCH', `/reading/${reading.id}`, 'other', { currentPage: 70 }, 404);
      await api('DELETE', `/reading/${reading.id}`, 'other', undefined, 404);
      await api('PATCH', `/reading/${reading.id}`, role, { currentPage: 42, privateNote: 'NEVER_PUBLIC_QA' });
      await api('PATCH', `/reading/${reading.id}`, role, { currentPage: -1 }, 400);
      assert.equal((await api('GET', '/reading', role))[0].currentPage, 42);
      await api('GET', `/reading/vibe-card/${reading.id}`, null, undefined, 403);
      await api('POST', '/reading/finish', role, { bookId, currentPage: 100, rating: 4, publicReview: 'Public QA review', quote: 'Public quote' });
      for (const publicPath of [`/reading/user/${owner.id}/finished`, `/reading/vibe-card/${reading.id}`, `/reviews/book/${bookId}`, `/books/${bookId}`]) {
        assert.ok(!JSON.stringify(await api('GET', publicPath, null)).includes('NEVER_PUBLIC_QA'), publicPath);
      }
      await api('DELETE', `/reading/${reading.id}`, role);
      assert.equal((await api('GET', '/reading', role)).length, 0);
    }
    for (const [method, url, body] of [['GET', '/reading'], ['POST', '/reading/start', { bookId }], ['POST', '/reading/finish', { bookId }], ['PUT', '/reading/1', { currentPage: 1 }], ['DELETE', '/reading/1'], ['GET', '/wishlists'], ['POST', '/wishlists', { bookId }], ['PUT', '/wishlists/1', { reason: 'Denied' }], ['DELETE', '/wishlists/1']]) await api(method, url, null, body, 401);
    readingId = (await api('POST', '/reading/start', 'member', { bookId }, 201)).id;
  });
  await t.test('reviews/moderation: public projection, edit, report, staff removal and retained private note', async () => {
    await api('PATCH', `/reading/${readingId}`, 'member', { privateNote: 'MODERATION_PRIVATE_QA' });
    const review = await api('POST', '/reviews', 'member', { bookId, rating: 5, publicReview: 'Original review' }, 201);
    await api('POST', '/reviews', 'member', { bookId, rating: 4, publicReview: 'Revised review', isSpoiler: true }, 201);
    assert.equal((await api('GET', `/reviews/book/${bookId}`, null))[0].publicReview, 'Revised review');
    await api('POST', `/reviews/${review.id}/report`, 'other', { reason: 'QA report' });
    await api('POST', '/reviews', null, { bookId, publicReview: 'Denied' }, 401);
    await api('POST', `/reviews/${review.id}/report`, null, { reason: 'Denied' }, 401);
    await deny('GET', '/moderation/reviews', undefined, ['admin', 'librarian']);
    await deny('PATCH', `/moderation/reviews/${review.id}`, { status: 'Removed', reason: 'Denied' }, ['admin', 'librarian']);
    for (const role of ['admin', 'librarian']) {
      const detail = await api('GET', `/moderation/reviews/${review.id}`, role);
      assert.equal(detail.flagReason, 'QA report'); assert.ok(!JSON.stringify(detail).includes('MODERATION_PRIVATE_QA'));
      assert.ok((await api('GET', '/moderation/reviews?status=Flagged', role)).some((row) => row.id === review.id));
    }
    await api('PATCH', `/moderation/reviews/${review.id}`, 'librarian', { status: 'Approved', reason: 'Reviewed' });
    await api('PATCH', `/moderation/reviews/${review.id}`, 'admin', { status: 'Removed', reason: 'Removed by QA' });
    assert.equal((await api('GET', `/reviews/book/${bookId}`, null)).length, 0);
    assert.equal((await api('GET', '/reading', 'member'))[0].privateNote, 'MODERATION_PRIVATE_QA');
  });
  await t.test('members: registration, safe read, Admin-only status/delete, suspended and deleted tokens rejected', async () => {
    const session = await api('POST', '/auth/register', null, { username: 'qa-new-member', email: 'new@qa.example.invalid', password: 'QA password 12345', role: 'Admin' }, 201);
    assert.equal(session.user.role, 'Member'); tokens.newMember = session.token;
    const id = session.user.id;
    for (const [method, url, body] of [['GET', '/members'], ['GET', `/members/${id}`], ['PATCH', `/members/${id}/status`, { status: 'Suspended' }], ['DELETE', `/members/${id}`]]) await deny(method, url, body, ['admin']);
    assert.ok((await api('GET', '/members', 'admin')).some((row) => row.id === id));
    assert.equal((await api('GET', `/members/${id}`, 'admin')).username, 'qa-new-member');
    const member = await api('GET', `/members/${qa.accounts.member.id}`, 'admin');
    assert.ok(member.activitySummary); assert.ok(!JSON.stringify(member).includes('MODERATION_PRIVATE_QA')); assert.equal(member.password, undefined);
    await api('PATCH', `/members/${id}/status`, 'admin', { status: 'Suspended' });
    await api('GET', '/auth/me', 'newMember', undefined, 401);
    await api('POST', '/auth/login', null, { email: session.user.email, password: 'QA password 12345' }, 403);
    await api('PATCH', `/members/${id}/status`, 'admin', { status: 'Active' });
    await api('DELETE', `/members/${id}`, 'admin');
    await api('GET', `/members/${id}`, 'admin', undefined, 404);
    await api('GET', '/auth/me', 'newMember', undefined, 401);
  });
  await t.test('staff: Admin-only CRUD and self-lockout protections', async () => {
    const body = { username: 'qa-created-staff', email: 'staff@qa.example.invalid', password: 'QA staff password 12345', role: 'Librarian', fullname: 'Created staff' };
    await deny('POST', '/staff', body, ['admin']);
    const staff = await api('POST', '/staff', 'admin', body, 201);
    for (const [method, url, payload] of [['GET', '/staff'], ['GET', `/staff/${staff.id}`], ['PUT', `/staff/${staff.id}`, { status: 'Suspended' }], ['DELETE', `/staff/${staff.id}`]]) await deny(method, url, payload, ['admin']);
    assert.equal(staff.password, undefined); assert.equal((await api('GET', `/staff/${staff.id}`, 'admin')).profile.fullname, body.fullname);
    assert.ok((await api('GET', '/staff', 'admin')).some((row) => row.id === staff.id));
    await api('PUT', `/staff/${staff.id}`, 'admin', { role: 'Admin', status: 'Suspended' });
    assert.equal((await api('GET', `/staff/${staff.id}`, 'admin')).status, 'Suspended');
    await api('PUT', `/staff/${qa.accounts.admin.id}`, 'admin', { role: 'Librarian' }, 409);
    await api('DELETE', `/staff/${qa.accounts.admin.id}`, 'admin', undefined, 409);
    await api('DELETE', `/staff/${staff.id}`, 'admin');
    await api('GET', `/staff/${staff.id}`, 'admin', undefined, 404);
  });
  await t.test('settings/analytics/recommendations: role boundaries, persistence and real aggregates', async () => {
    for (const [method, url, body] of [['GET', '/settings'], ['PUT', '/settings', { googleBooksEnabled: false }], ['POST', '/settings/preview', { settings: {}, moods: [] }]]) await deny(method, url, body, ['admin']);
    await api('PUT', '/settings', 'admin', { curationWeightBonus: 0.25, googleBooksEnabled: false });
    assert.equal((await api('GET', '/settings', 'admin')).curationWeightBonus, 0.25);
    assert.ok(Array.isArray(await api('POST', '/settings/preview', 'admin', { settings: { curationWeightBonus: 0.25 }, moods: [] })));
    await api('PUT', '/settings', 'admin', { curationWeightBonus: 2 }, 400);
    for (const url of ['/analytics/overview', '/analytics/wishlist-intelligence', '/analytics/reading', '/analytics/top-wishlisted', '/analytics/mood-distribution']) {
      await deny('GET', url, undefined, ['admin', 'librarian']);
      for (const role of ['admin', 'librarian']) await api('GET', url, role);
    }
    const overview = await api('GET', '/analytics/overview', 'admin');
    assert.equal(overview.totalBooks, 1);
    for (const role of [null, 'member', 'librarian', 'admin']) {
      assert.ok(Array.isArray((await api('POST', '/recommendations/match', role, { moodTags: ['QA Mood'] })).matches));
      assert.ok((await api('GET', '/recommendations/editorial', role)).some((row) => row.id === pickId));
    }
    await deny('GET', '/integrations/google-books/search?query=QA', undefined, ['admin', 'librarian']);
    await api('GET', '/integrations/google-books/search?query=QA', 'librarian', undefined, 403);
  });
  t.diagnostic(`${requests} HTTP requests asserted against production routes, middleware, services and migrated PostgreSQL.`);
});
