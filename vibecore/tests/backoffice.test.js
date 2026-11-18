const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const load = require('./helpers/load-module');
const source = (file) => path.join(__dirname, '../src', file);
const { AppError } = load(source('errors/app-error.js'));
const errors = {
  '../../errors/app-error': { AppError },
  '../../contracts/error-codes': { ErrorCodes: {} },
};

test('Google Books provider failures stay explicit and do not expose credentials', async () => {
  const { GoogleBooksClient } = load(
    source('integrations/google-books/google-books.client.js'),
    {
      axios: {
        get: async (url, options) => {
          assert.equal(options.timeout, 8000);
          throw {
            response: { status: 429 },
            message: 'sensitive provider debug text',
          };
        },
      },
      '../../config/env': { ENV: { GOOGLE_BOOKS_API_KEY: 'isolated-qa-key' } },
      '../../errors/app-error': { AppError },
    },
  );
  await assert.rejects(
    GoogleBooksClient.searchVolumes('test query'),
    (error) =>
      error.statusCode === 502 &&
      error.errorCode === 'GOOGLE_BOOKS_ERROR' &&
      !error.message.includes('isolated-qa-key') &&
      !error.message.includes('sensitive'),
  );
});

test('staff-only and Admin-only HTTP routes enforce DB roles and suspension', async () => {
  const secret = 'backoffice-isolated-test-secret';
  const users = {
    1: { id: 1, role: 'Admin', status: 'Active' },
    2: { id: 2, role: 'Librarian', status: 'Active' },
    3: { id: 3, role: 'Member', status: 'Active' },
    4: { id: 4, role: 'Admin', status: 'Suspended' },
  };
  const auth = load(source('middlewares/authentication.js'), {
    jsonwebtoken: jwt,
    '../../models': { user: { findByPk: async (id) => users[id] } },
    '../config/env': { ENV: { JWT_SECRET: secret } },
    '../errors/app-error': { AppError },
    '../contracts/error-codes': { ErrorCodes: {} },
  });
  const authorization = load(source('middlewares/authorization.js'), {
    '../errors/app-error': { AppError },
    '../contracts/error-codes': { ErrorCodes: {} },
  });
  const handler = (req, res) => res.json({ success: true });
  const app = express();
  app.use(express.json());
  for (const [module, controller, methods, prefix] of [
    [
      'staff/staff.routes.js',
      'StaffController',
      ['list', 'getById', 'create', 'update', 'delete'],
      '/api/staff',
    ],
    [
      'members/member.routes.js',
      'MemberController',
      ['list', 'getById', 'updateStatus', 'delete'],
      '/api/members',
    ],
    [
      'settings/settings.routes.js',
      'SettingsController',
      ['getSettings', 'updateSettings', 'health', 'preview'],
      '/api/settings',
    ],
    [
      'moderation/moderation.routes.js',
      'ModerationController',
      ['listReviews', 'getById', 'moderate'],
      '/api/moderation',
    ],
  ]) {
    const name = module.split('/')[0];
    const singular = name === 'members' ? 'member' : name;
    const controllerPath = `./${singular}.controller`;
    const validatorPath = `./${singular}.validator`;
    const validators = load(source(`modules/${name}/${singular}.validator.js`));
    const validation = load(source('middlewares/validate-request.js'), {
      '../errors/app-error': { AppError },
      '../contracts/error-codes': { ErrorCodes: {} },
    });
    const routes = load(source(`modules/${module}`), {
      express,
      [controllerPath]: {
        [controller]: Object.fromEntries(
          methods.map((method) => [method, handler]),
        ),
      },
      [validatorPath]: validators,
      '../../middlewares/authentication': auth,
      '../../middlewares/authorization': authorization,
      '../../middlewares/validate-request': validation,
    });
    app.use(prefix, routes.default);
  }
  app.use((error, req, res, next) =>
    res.status(error.statusCode || 500).json({ message: error.message }),
  );
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const request = (url, id, method = 'GET', body) =>
    fetch(`http://127.0.0.1:${server.address().port}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(id && {
          Authorization: `Bearer ${jwt.sign({ id, role: 'Admin' }, secret)}`,
        }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
  try {
    for (const endpoint of [
      '/api/staff',
      '/api/members',
      '/api/moderation/reviews',
      '/api/settings',
    ]) {
      assert.equal((await request(endpoint)).status, 401);
      assert.equal((await request(endpoint, 3)).status, 403);
      assert.equal((await request(endpoint, 4)).status, 401);
      assert.equal((await request(endpoint, 1)).status, 200);
    }
    assert.equal((await request('/api/staff', 2)).status, 403);
    assert.equal((await request('/api/members', 2)).status, 403);
    assert.equal((await request('/api/settings', 2)).status, 403);
    assert.equal(
      (await request('/api/settings', 1, 'PUT', { JWT_SECRET: 'not-allowed' }))
        .status,
      400,
    );
    assert.equal((await request('/api/moderation/reviews', 2)).status, 200);
    assert.equal(
      (await request('/api/staff/2', 1, 'PUT', { role: 'Member' })).status,
      400,
    );
    assert.equal(
      (
        await request('/api/members/2/status', 1, 'PATCH', {
          status: 'Unknown',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request('/api/moderation/reviews/1', 2, 'PATCH', {
          status: 'Removed',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request('/api/moderation/reviews/1', 2, 'PATCH', {
          status: 'Removed',
          reason: 'Public policy violation',
        })
      ).status,
      200,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('member detail returns aggregate activity and never requests private reading fields', async () => {
  let options;
  const member = {
    role: 'Member',
    toJSON: () => ({ id: 1, username: 'member', role: 'Member' }),
  };
  const models = {
    user: {
      findByPk: async (id, input) => {
        options = input;
        return member;
      },
    },
    profile: {},
    reading_activity: { count: async ({ where }) => (where.status ? 2 : 3) },
    wishlist: { count: async () => 4 },
  };
  const { MemberService } = load(source('modules/members/member.service.js'), {
    ...errors,
    sequelize,
    '../../../models': models,
  });
  const result = await MemberService.getById(1);
  assert.equal(result.activitySummary.completedCount, 2);
  assert.equal(result.activitySummary.readingCount, 3);
  assert.equal(result.activitySummary.wishlistCount, 4);
  assert.equal(options.include.length, 1);
  assert.deepEqual([...options.include[0].attributes], ['fullname', 'image']);
  assert.ok(!options.attributes.includes('password'));
  member.role = 'Admin';
  await assert.rejects(
    MemberService.getById(1),
    (error) => error.statusCode === 404,
  );
});

test('moderation removes only public review and retains private note and decision audit', async () => {
  const activity = {
    id: 4,
    privateNote: 'private',
    publicReview: 'reported text',
    update: async function (input) {
      Object.assign(this, input);
    },
  };
  const { ModerationService } = load(
    source('modules/moderation/moderation.service.js'),
    {
      ...errors,
      sequelize,
      '../../../models': {
        reading_activity: { findByPk: async () => activity },
      },
    },
  );
  const result = await ModerationService.moderate(
    4,
    { status: 'Removed', reason: ' Violation ' },
    9,
  );
  assert.equal(activity.privateNote, 'private');
  assert.equal(activity.publicReview, null);
  assert.equal(activity.moderationReason, 'Violation');
  assert.equal(activity.moderatedBy, 9);
  assert.ok(!('privateNote' in result));
  assert.ok(!ModerationService.publicAttributes.includes('privateNote'));
});

test('review reports preserve the real reason and cannot target private reading entries', async () => {
  const activity = {
    publicReview: 'Public review',
    update: async function (payload) {
      Object.assign(this, payload);
    },
  };
  const { ReviewService } = load(source('modules/reviews/review.service.js'), {
    ...errors,
    sequelize,
    '../../../models': { reading_activity: { findByPk: async () => activity } },
  });
  await ReviewService.reportReview(1, { reason: ' Spam report ' });
  assert.equal(activity.flagReason, 'Spam report');
  assert.equal(activity.isFlagged, true);
  assert.equal(activity.moderationStatus, 'Flagged');
  await assert.rejects(
    ReviewService.reportReview(1, { reason: 5 }),
    (error) => error.statusCode === 400,
  );
  activity.publicReview = null;
  await assert.rejects(
    ReviewService.reportReview(1, { reason: 'Not public' }),
    (error) => error.statusCode === 404,
  );
});

test('settings validate bounds and use the same ranking weights as the live preview', async () => {
  const { Ranker } = load(source('modules/recommendations/ranker.js'));
  const candidates = [
    { id: 1, title: 'Normal' },
    {
      id: 2,
      title: 'Curated',
      editorialPicks: [{ isActive: true, curationWeight: 100 }],
    },
  ];
  const { SettingsService } = load(
    source('modules/settings/settings.service.js'),
    {
      '../../../models': {},
      './settings.validator': load(
        source('modules/settings/settings.validator.js'),
      ),
      '../../config/env': { ENV: {} },
      '../../errors/app-error': { AppError },
      '../../integrations/google-books/google-books.client': {
        GoogleBooksClient: {},
      },
      '../recommendations/candidate-selector': {
        CandidateSelector: { selectCandidates: async () => candidates },
      },
      '../recommendations/ranker': { Ranker },
    },
  );
  for (const input of [
    { curationWeightBonus: 1.01 },
    { moodMatchBaseScore: '0.5' },
    { JWT_SECRET: 'not-allowed' },
    { googleBooksEnabled: 'true' },
  ])
    assert.throws(() => SettingsService.validate(input));
  const result = await SettingsService.preview({
    settings: {
      curationWeightBonus: 0.25,
      moodMatchBaseScore: 0.5,
      minMatchScoreThreshold: 0.6,
    },
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
  assert.equal(result[0].matchScore, 75);
  assert.ok(!('description' in result[0]));
});

test('public registration cannot choose a staff role', async () => {
  let created;
  const { AuthService } = load(source('modules/auth/auth.service.js'), {
    bcryptjs: { hash: async () => 'test-hash' },
    jsonwebtoken: { sign: () => 'test-token' },
    '../../../models': {
      sequelize: { transaction: async (work) => work({}) },
      user: {
        findOne: async () => null,
        create: async (payload) => {
          created = payload;
          return { id: 5, ...payload };
        },
      },
      profile: { create: async () => ({ id: 3 }) },
    },
    '../../config/env': { ENV: {} },
    ...errors,
  });
  const result = await AuthService.register({
    username: 'member-qa',
    email: 'member@example.invalid',
    password: 'qa-only',
    role: 'Admin',
  });
  assert.equal(created.role, 'Member');
  assert.equal(result.user.role, 'Member');
  assert.ok(!('password' in result.user));
});

test('staff mutation guards prevent self-lockout and deleting the last active Admin', async () => {
  const admin = {
    id: 1,
    role: 'Admin',
    status: 'Active',
    update: async function (payload) {
      Object.assign(this, payload);
    },
    destroy: async () => {
      throw new Error('Must not delete last admin');
    },
  };
  let locks = 0;
  const model = {
    user: { findByPk: async () => admin, count: async () => 1 },
    sequelize: {
      transaction: async (callback) => callback({}),
      query: async () => {
        locks++;
      },
    },
  };
  const { StaffService } = load(source('modules/staff/staff.service.js'), {
    bcryptjs: {},
    sequelize,
    '../../../models': model,
    ...errors,
  });
  await assert.rejects(
    StaffService.update(1, { role: 'Librarian' }, 1),
    (error) => error.statusCode === 409,
  );
  await assert.rejects(
    StaffService.update(1, { status: 'Suspended' }, 2),
    (error) => error.statusCode === 409,
  );
  await assert.rejects(
    StaffService.delete(1, 2),
    (error) => error.statusCode === 409,
  );
  assert.equal(admin.role, 'Admin');
  assert.equal(admin.status, 'Active');
  assert.equal(locks, 3);
});

test('staff account creation rolls profile and user into the same transaction', async () => {
  const transaction = {};
  const options = [];
  const model = {
    user: {
      findOne: async () => null,
      create: async (payload, config) => {
        options.push(config);
        return { id: 9, ...payload };
      },
    },
    profile: {
      create: async (payload, config) => {
        options.push(config);
        return { id: 8, ...payload };
      },
    },
    sequelize: { transaction: async (callback) => callback(transaction) },
  };
  const { StaffService } = load(source('modules/staff/staff.service.js'), {
    bcryptjs: { hash: async () => 'qa-hash' },
    sequelize,
    '../../../models': model,
    ...errors,
  });
  const result = await StaffService.create({
    username: 'staff-qa',
    email: 'staff@example.invalid',
    password: 'test-password-only',
    role: 'Librarian',
    status: 'Suspended',
  });
  assert.equal(options.length, 2);
  assert.ok(options.every((config) => config.transaction === transaction));
  assert.equal(result.status, 'Suspended');
  assert.ok(!('password' in result));
});
