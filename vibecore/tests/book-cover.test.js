const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const loadModule = require('./helpers/load-module');

const source = (filename) => path.join(__dirname, '../src', filename);

test('cover upload HTTP contract, authorization, content validation and public serving', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'vibecore-cover-test-'));
  const { AppError } = loadModule(source('errors/app-error.js'));
  const { ApiResponse } = loadModule(source('utils/api-response.js'));
  const errors = { '../../errors/app-error': { AppError } };
  const serviceFile = source('modules/books/book-cover.service.js');
  const { BookCoverService } = loadModule(serviceFile, {
    path, 'fs/promises': fs, crypto: require('crypto'), sharp, ...errors,
  }, { process: { env: { BOOK_COVER_STORAGE_DIR: directory } }, __dirname: path.dirname(serviceFile) });
  const controller = loadModule(source('modules/books/book-cover.controller.js'), {
    './book-cover.service': { BookCoverService }, '../../utils/api-response': { ApiResponse }, ...errors,
  });
  const validator = loadModule(source('modules/books/book-cover.validator.js'), { multer, ...errors });
  const secret = 'isolated-cover-test-secret';
  const auth = loadModule(source('middlewares/authentication.js'), {
    jsonwebtoken: jwt,
    '../../models': { user: { findByPk: async (id) => ({ id, role: { 1: 'Admin', 2: 'Member', 3: 'Librarian' }[id] }) } },
    '../config/env': { ENV: { JWT_SECRET: secret } },
    '../errors/app-error': { AppError }, '../contracts/error-codes': { ErrorCodes: {} },
  });
  const authorization = loadModule(source('middlewares/authorization.js'), {
    '../errors/app-error': { AppError }, '../contracts/error-codes': { ErrorCodes: {} },
  });
  const routes = loadModule(source('modules/books/book.routes.js'), {
    express,
    './book.controller': { BookController: Object.fromEntries(['list', 'getById', 'create', 'update', 'delete'].map((name) => [name, (req, res) => res.json({ unused: true })])) },
    '../../middlewares/validate-request': { validateRequest: () => (req, res, next) => next() },
    './book.validator': {},
    '../../middlewares/authentication': auth,
    '../../middlewares/authorization': authorization,
    './book-cover.controller': controller,
    './book-cover.validator': validator,
  });
  const app = express();
  app.use('/api/books', routes.default);
  app.use((error, req, res, next) => ApiResponse.error(res, error.message, error.statusCode || 500, error.errorCode));
  const server = await new Promise((resolve) => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const png = await sharp({ create: { width: 20, height: 30, channels: 3, background: 'white' } }).png().toBuffer();
  const token = (id) => jwt.sign({ id }, secret);
  const upload = (buffer = png, type = 'image/png', authToken = token(1), count = 1, field = 'cover') => {
    const body = new FormData();
    for (let i = 0; i < count; i++) body.append(field, new Blob([buffer], { type }), '../cover.svg');
    return fetch(`${base}/api/books/covers`, { method: 'POST', body, headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} });
  };
  try {
    await t.test('requires authentication and staff role before accepting files', async () => {
      assert.equal((await upload(png, 'image/png', null)).status, 401);
      assert.equal((await upload(png, 'image/png', token(2))).status, 403);
      assert.equal((await fs.readdir(directory)).length, 0);
    });
    await t.test('staff upload is normalized to WebP and served without authentication', async () => {
      const response = await upload();
      assert.equal(response.status, 201);
      const payload = await response.json();
      assert.match(payload.data.path, /^\/api\/books\/covers\/[0-9a-f-]+\.webp$/);
      const cover = await fetch(base + payload.data.path);
      assert.equal(cover.status, 200);
      assert.equal(cover.headers.get('content-type'), 'image/webp');
      assert.equal(cover.headers.get('x-content-type-options'), 'nosniff');
      const metadata = await sharp(Buffer.from(await cover.arrayBuffer())).metadata();
      assert.equal(metadata.format, 'webp');
      assert.equal(metadata.width, 20);
      assert.equal(metadata.height, 30);
      assert.equal((await upload(png, 'image/png', token(3))).status, 201);
    });
    await t.test('rejects unsupported MIME, spoofed image contents and oversized files', async () => {
      assert.equal((await upload(png, 'image/svg+xml')).status, 400);
      assert.equal((await upload(Buffer.from('<script>not an image</script>'))).status, 400);
      assert.equal((await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30"></svg>'))).status, 400);
      assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
      const excessivePixels = await sharp({ create: { width: 5000, height: 4001, channels: 3, background: 'white' } }).png().toBuffer();
      assert.equal((await upload(excessivePixels)).status, 400);
      assert.equal((await fs.readdir(directory)).length, 2);
    });
    await t.test('rejects missing files, multiple files and unexpected field names', async () => {
      assert.equal((await upload(png, 'image/png', token(1), 0)).status, 400);
      assert.equal((await upload(png, 'image/png', token(1), 2)).status, 400);
      assert.equal((await upload(png, 'image/png', token(1), 1, 'other')).status, 400);
    });
    await t.test('invalid filenames never resolve outside the cover directory', async () => {
      assert.throws(() => BookCoverService.resolvePath('../secret.txt'));
      assert.throws(() => BookCoverService.resolvePath('cover.svg'));
      assert.equal((await fetch(`${base}/api/books/covers/00000000-0000-0000-0000-000000000000.webp`)).status, 404);
    });
    await t.test('storage failures return an actionable error without filesystem paths', async () => {
      const blocked = path.join(directory, 'blocked-storage');
      await fs.writeFile(blocked, 'fixture');
      await assert.rejects(BookCoverService.store({ buffer: png }, blocked), (error) => {
        assert.equal(error.statusCode, 500);
        assert.equal(error.errorCode, 'COVER_STORAGE_ERROR');
        assert.equal(error.message.includes(directory), false);
        return true;
      });
    });
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    assert.ok(directory.startsWith(path.join(os.tmpdir(), 'vibecore-cover-test-')));
    await fs.rm(directory, { recursive: true, force: true });
  }
});
