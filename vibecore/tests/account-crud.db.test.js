const test = require('node:test');
const assert = require('node:assert/strict');
const createQaApi = require('./helpers/qa-api');

test('profile and account changes persist with ownership, credential verification and session revocation', { skip: process.env.RUN_CRUD_DB_TESTS !== '1', timeout: 90000 }, async (t) => {
  const qa = await createQaApi();
  t.after(qa.close);
  const request = async (method, route, body, token) => {
    const response = await fetch(`${qa.baseUrl}/api${route}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, ...(await response.json()) };
  };
  const login = async (account) => { const result = await request('POST', '/auth/login', account); assert.equal(result.status, 200); return result.data.token; };
  let token = await login(qa.accounts.member);
  const admin = await login(qa.accounts.admin);
  const profileId = (await qa.db.user.findByPk(qa.accounts.member.id)).profileId;
  const otherProfileId = (await qa.db.user.findByPk(qa.accounts.other.id)).profileId;
  await t.test('malformed credentials return validation errors without creating accounts', async () => {
    const valid = { username: 'invalid-input-reader', email: 'invalid-input@qa.example.invalid', password: 'QA-valid-password' };
    for (const change of [{ username: {} }, { email: [] }, { email: 'not-an-email' }, { password: [] }, { password: 'x'.repeat(73) }, { fullname: {} }]) assert.equal((await request('POST', '/auth/register', { ...valid, ...change })).status, 400);
    for (const body of [{ email: {}, password: 'x' }, { email: valid.email, password: [] }]) assert.equal((await request('POST', '/auth/login', body)).status, 400);
    assert.equal(await qa.db.user.count(), 4);
  });
  await t.test('new migrations reverse and reapply; duplicate guard preserves existing identities', async () => {
    const query = qa.db.sequelize.getQueryInterface();
    for (const file of ['20261118100000-add-review-title', '20261118101000-add-profile-bio-location', '20261118103000-add-review-visibility']) {
      const migration = require(`../migrations/${file}`);
      await migration.down(query);
      await migration.up(query, qa.db.Sequelize);
    }
    const unique = require('../migrations/20261118102000-enforce-user-identity-uniqueness');
    await unique.down(query);
    const duplicate = await qa.db.user.create({ username: qa.accounts.member.username, email: 'duplicate@qa.example.invalid', password: 'unused-test-hash' });
    await assert.rejects(unique.up(query), /duplicate identities must be resolved/);
    assert.equal(await qa.db.user.count(), 5);
    assert.equal((await qa.db.user.findByPk(qa.accounts.member.id)).email, qa.accounts.member.email);
    await duplicate.destroy();
    await unique.up(query);
    assert.equal(await qa.db.user.count(), 4);
  });
  await t.test('concurrent registration creates one identity and leaves no orphan profile', async () => {
    const profilesBefore = await qa.db.profile.count();
    const payload = { username: 'concurrent-reader', email: 'concurrent@qa.example.invalid', password: 'QA-register-password-2026' };
    const results = await Promise.all([request('POST', '/auth/register', payload), request('POST', '/auth/register', payload)]);
    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
    assert.equal(await qa.db.user.count({ where: { username: payload.username } }), 1);
    assert.equal(await qa.db.profile.count(), profilesBefore + 1);
  });
  await t.test('profile update persists all visible fields and cannot target another user or change role', async () => {
    const result = await request('PUT', '/auth/profile', { fullname: 'Browser Reader', username: 'browser-reader', bio: 'QA reading bio', location: 'QA City', image: '', id: qa.accounts.other.id, profileId: otherProfileId, role: 'Admin' }, token);
    assert.equal(result.status, 200);
    const me = await request('GET', '/auth/me', undefined, token);
    assert.equal(me.data.user.username, 'browser-reader');
    assert.equal(me.data.user.profile.bio, 'QA reading bio');
    assert.equal(me.data.user.profile.location, 'QA City');
    assert.equal(me.data.user.role, 'Member');
    assert.equal((await qa.db.profile.findByPk(otherProfileId)).fullname, 'QA other');
    assert.equal((await request('PUT', '/auth/profile', { username: 'qa-other', fullname: 'Must rollback' }, token)).status, 409);
    assert.equal((await qa.db.profile.findByPk(profileId)).fullname, 'Browser Reader');
    assert.equal((await request('PUT', '/auth/profile', { bio: 'x'.repeat(2001) }, token)).status, 400);
    assert.equal((await request('PUT', '/auth/profile', { username: 'bad name' }, token)).status, 400);
    const publicProfile = await request('GET', '/auth/public/browser-reader');
    assert.equal(publicProfile.status, 200);
    assert.equal(publicProfile.data.user.profile.bio, 'QA reading bio');
    for (const privateField of ['email', 'password', 'tokenVersion', 'age', 'gender']) assert.ok(!JSON.stringify(publicProfile.data).includes(`"${privateField}"`));
    assert.equal((await request('GET', '/auth/public/does-not-exist')).status, 404);
  });
  await t.test('email change verifies password, handles conflicts and invalidates the previous session', async () => {
    assert.equal((await request('PATCH', '/auth/account', { email: 'new@qa.example.invalid', currentPassword: 'incorrect' }, token)).status, 401);
    assert.equal((await request('PATCH', '/auth/account', { email: qa.accounts.other.email, currentPassword: qa.accounts.member.password }, token)).status, 409);
    assert.equal((await request('GET', '/auth/me', undefined, token)).status, 200);
    assert.equal((await request('PATCH', '/auth/account', { email: 'new@qa.example.invalid', currentPassword: qa.accounts.member.password }, token)).status, 200);
    assert.equal((await request('GET', '/auth/me', undefined, token)).status, 401);
    token = await login({ email: 'new@qa.example.invalid', password: qa.accounts.member.password });
  });
  await t.test('password change enforces strength and revokes old credentials and sessions', async () => {
    assert.equal((await request('PUT', '/auth/password', { currentPassword: qa.accounts.member.password, password: 'short' }, token)).status, 400);
    assert.equal((await request('PUT', '/auth/password', { currentPassword: 'incorrect', password: 'QA-new-password-2026' }, token)).status, 401);
    assert.equal((await request('PUT', '/auth/password', { currentPassword: qa.accounts.member.password, password: 'QA-new-password-2026' }, token)).status, 200);
    assert.equal((await request('GET', '/auth/me', undefined, token)).status, 401);
    assert.equal((await request('POST', '/auth/login', { email: 'new@qa.example.invalid', password: qa.accounts.member.password })).status, 401);
    token = await login({ email: 'new@qa.example.invalid', password: 'QA-new-password-2026' });
  });
  await t.test('delete removes only the verified Member account and its own dependent records', async () => {
    const book = (await request('POST', '/books', { title: 'Account QA book' }, admin)).data;
    await request('POST', '/reading/start', { bookId: book.id }, token);
    await request('POST', '/wishlists', { bookId: book.id }, token);
    assert.equal((await request('DELETE', '/auth/account', { currentPassword: 'incorrect' }, token)).status, 401);
    assert.equal((await request('DELETE', '/auth/account', { currentPassword: qa.accounts.admin.password }, admin)).status, 403);
    assert.equal((await request('DELETE', '/auth/account', { currentPassword: 'QA-new-password-2026' }, token)).status, 200);
    assert.equal((await request('GET', '/auth/me', undefined, token)).status, 401);
    assert.equal(await qa.db.user.findByPk(qa.accounts.member.id), null);
    assert.equal(await qa.db.profile.findByPk(profileId), null);
    assert.equal(await qa.db.reading_activity.count({ where: { userId: qa.accounts.member.id } }), 0);
    assert.equal(await qa.db.wishlist.count({ where: { userId: qa.accounts.member.id } }), 0);
    assert.ok(await qa.db.user.findByPk(qa.accounts.other.id));
    assert.equal((await request('GET', '/auth/public/browser-reader')).status, 404);
  });
});
