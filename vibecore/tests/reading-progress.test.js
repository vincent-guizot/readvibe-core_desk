const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const express = require('express');
const load = require('./helpers/load-module');
const source = (file) => path.join(__dirname, '../src', file);
const { AppError } = load(source('errors/app-error.js'));
const validators = load(source('modules/reading/reading.validator.js'));

test('progress validators accept legacy bodies and integer pages, rejecting invalid types and overflow', () => {
  for (const validate of Object.values(validators)) {
    for (const currentPage of [undefined, 0, 42, 2147483647]) {
      assert.equal(validate({ body: { bookId: 10, currentPage } }), null);
    }
    for (const currentPage of [null, -1, 1.5, '12', true, [], {}, NaN, Infinity, 2147483648]) {
      assert.ok(validate({ body: { bookId: 10, currentPage } }), String(currentPage));
    }
  }
});

test('resource exposes progress to the owner without adding it to public projections', () => {
  const { toReadingActivityResource } = load(source('contracts/resources/reading-activity.resource.js'));
  const activity = { id: 7, currentPage: 42, privateNote: 'Private' };
  assert.equal(toReadingActivityResource(activity, true).currentPage, 42);
  assert.equal(Object.hasOwn(toReadingActivityResource(activity), 'currentPage'), false);
});

test('reading HTTP contract persists progress through start, update, finish and list with ownership isolation', async (t) => {
  let activity;
  const db = {
    book: { findByPk: async () => ({ id: 10, page: 100 }) },
    wishlist: { destroy: async () => {} },
    reading_activity: {
      findOne: async ({ where }) => activity && where.userId === activity.userId ? activity : null,
      create: async (values) => {
        activity = { id: 7, ...values, update: async (changes) => Object.assign(activity, changes) };
        return activity;
      },
      findByPk: async () => activity,
      findAll: async ({ where }) => activity && where.userId === activity.userId ? [activity] : [],
    },
  };
  const service = load(source('modules/reading/reading.service.js'), {
    '../../../models': db,
    '../../errors/app-error': { AppError },
    '../../contracts/error-codes': { ErrorCodes: {} },
  });
  const controller = load(source('modules/reading/reading.controller.js'), {
    './reading.service': service,
    '../../utils/api-response': load(source('utils/api-response.js')),
  });
  const middleware = load(source('middlewares/validate-request.js'), {
    '../errors/app-error': { AppError },
    '../contracts/error-codes': { ErrorCodes: { VALIDATION_ERROR: 'VALIDATION_ERROR' } },
  });
  const routes = load(source('modules/reading/reading.routes.js'), {
    express,
    './reading.controller': controller,
    './reading.validator': validators,
    '../../middlewares/validate-request': middleware,
    '../../middlewares/authentication': {
      authentication(req, res, next) {
        if (!req.headers['x-fixture-user']) return next(AppError.unauthorized());
        req.user = { id: Number(req.headers['x-fixture-user']) };
        next();
      },
    },
  });
  const app = express();
  app.use(express.json());
  app.use('/api/reading', routes.default);
  app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ error: error.errorCode }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const request = async (method, suffix, body, user = 1) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/reading${suffix}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(user ? { 'x-fixture-user': String(user) } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };
  assert.equal((await request('POST', '/start', { bookId: 10 }, null)).status, 401);
  assert.equal((await request('POST', '/start', { bookId: 10 })).body.data.currentPage, 0);
  assert.equal((await request('PUT', '/7', { currentPage: 24 })).body.data.currentPage, 24);
  assert.equal((await request('PATCH', '/7', { privateNote: 'Keep progress' })).body.data.currentPage, 24);
  assert.equal((await request('PATCH', '/7', { currentPage: 0 })).body.data.currentPage, 0);
  assert.equal((await request('POST', '/start', { bookId: 10, currentPage: 12 })).body.data.currentPage, 12);
  assert.equal((await request('POST', '/start', { bookId: 10 })).body.data.currentPage, 12);
  for (const [method, suffix] of [['POST', ''], ['POST', '/start'], ['POST', '/finish'], ['PUT', '/7'], ['PATCH', '/7']]) {
    const result = await request(method, suffix, { bookId: 10, currentPage: -1 });
    assert.equal(result.status, 400);
    assert.equal(result.body.error, 'VALIDATION_ERROR');
  }
  assert.equal(activity.currentPage, 12);
  assert.equal((await request('PUT', '/7', { currentPage: 70 }, 2)).status, 404);
  assert.equal(activity.currentPage, 12);
  assert.equal((await request('POST', '/finish', { bookId: 10, currentPage: 100 })).body.data.currentPage, 100);
  assert.equal((await request('POST', '/finish', { bookId: 10 })).body.data.currentPage, 100);
  assert.equal((await request('GET', '')).body.data[0].currentPage, 100);
  assert.deepEqual((await request('GET', '', undefined, 2)).body.data, []);
  activity = null;
  assert.equal((await request('POST', '', { bookId: 10, currentPage: 9 })).body.data.currentPage, 9);
  activity = null;
  assert.equal((await request('POST', '/finish', { bookId: 10, currentPage: 80 })).body.data.currentPage, 80);
  activity = null;
  assert.equal((await request('POST', '/finish', { bookId: 10 })).body.data.currentPage, 0);
});
