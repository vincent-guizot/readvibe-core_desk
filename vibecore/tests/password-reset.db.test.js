const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const load = require('./helpers/load-module');
const source = (file) => path.join(__dirname, '../src', file);

test('PostgreSQL and local SMTP: recovery, single-use concurrency, expiry, session revocation and reading persistence', {
  skip: process.env.RUN_AUTH_DB_TESTS !== '1', timeout: 60000,
}, async (t) => {
  const qa = await require('./helpers/qa-api')();
  const db = qa.db;
  t.after(qa.close);
  const messages = [];
  const smtpSockets = new Set();
  const smtp = net.createServer((socket) => {
    smtpSockets.add(socket);
    socket.on('close', () => smtpSockets.delete(socket));
    socket.write('220 localhost test SMTP\r\n');
    let buffer = '', data = null;
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      let end;
      while ((end = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
        if (data) {
          if (line === '.') { messages.push(data.join('\r\n')); data = null; socket.write('250 Accepted\r\n'); }
          else data.push(line);
        } else if (/^EHLO|^HELO/.test(line)) socket.write('250-localhost\r\n250 8BITMIME\r\n');
        else if (line === 'DATA') { data = []; socket.write('354 Send message\r\n'); }
        else if (line === 'QUIT') socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  smtp.listen(0, '127.0.0.1');
  await new Promise((resolve) => smtp.once('listening', resolve));
  const env = { NODE_ENV: 'test', JWT_SECRET: crypto.randomUUID(), JWT_EXPIRES_IN: '1h', READVIBE_URL: 'http://localhost:3350', SMTP: { HOST: '127.0.0.1', PORT: smtp.address().port, SECURE: false, FROM: 'test@example.invalid' } };
  const { AppError } = load(source('errors/app-error.js'));
  const errors = { '../../errors/app-error': { AppError }, '../../contracts/error-codes': { ErrorCodes: {} } };
  const mailer = load(source('integrations/email/password-reset-mailer.js'), { nodemailer: require('nodemailer'), '../../config/env': { ENV: env }, '../../errors/app-error': { AppError } }, { URL });
  const resets = load(source('modules/auth/password-reset.service.js'), { 'node:crypto': crypto, '../../../models': db, bcryptjs: bcrypt, '../../errors/app-error': { AppError }, '../../integrations/email/password-reset-mailer': mailer });
  const authService = load(source('modules/auth/auth.service.js'), { bcryptjs: bcrypt, jsonwebtoken: jwt, '../../../models': db, '../../config/env': { ENV: env }, ...errors });
  const response = load(source('utils/api-response.js'));
  const controller = load(source('modules/auth/auth.controller.js'), { './auth.service': authService, '../../utils/api-response': response });
  const resetController = load(source('modules/auth/password-reset.controller.js'), { './password-reset.service': resets, '../../utils/api-response': response });
  const auth = load(source('middlewares/authentication.js'), { jsonwebtoken: jwt, '../../models': db, '../config/env': { ENV: env }, '../errors/app-error': { AppError }, '../contracts/error-codes': { ErrorCodes: {} } });
  const middleware = load(source('middlewares/validate-request.js'), { '../errors/app-error': { AppError }, '../contracts/error-codes': { ErrorCodes: {} } });
  const routes = load(source('modules/auth/auth.routes.js'), {
    express, './auth.controller': controller, './password-reset.controller': resetController,
    './auth.validator': load(source('modules/auth/auth.validator.js'), {}, { Buffer }),
    '../../middlewares/validate-request': middleware, '../../middlewares/authentication': auth,
    '../../middlewares/password-reset-rate-limit': { passwordResetRateLimit: () => (req, res, next) => next() },
  });
  const app = express(); app.use(express.json()); app.use('/api/auth', routes.default);
  app.use((error, req, res, next) => response.ApiResponse.error(res, error.message, error.statusCode || 500, error.errorCode));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  let user, book;
  t.after(async () => {
    await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
    for (const socket of smtpSockets) socket.destroy();
    await new Promise((resolve) => smtp.close(resolve));
  });
  const request = async (suffix, body, bearer) => {
    const result = await fetch(`http://127.0.0.1:${server.address().port}/api/auth${suffix}`, {
      method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: result.status, body: await result.json() };
  };
  const marker = `reset-${crypto.randomUUID()}`;
  user = await db.user.create({ username: marker, email: `${marker}@example.invalid`, password: await bcrypt.hash('Old password 123', 4), status: 'Active', role: 'Member' });
  const oldJwt = authService.AuthService.generateToken(user);
  const unknown = await request('/forgot-password', { email: `unknown-${marker}@example.invalid` });
  const known = await request('/forgot-password', { email: user.email });
  assert.equal(known.status, 200); assert.deepEqual(known.body.data, {});
  assert.equal(known.body.message, unknown.body.message); assert.equal(unknown.status, 200);
  assert.equal(messages.length, 1);
  // Decode quoted-printable so Nodemailer's line wrapping does not alter the URL.
  const message = messages[0].replace(/=\r\n/g, '').replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const token = message.match(/#token=([a-f0-9]{64})/)[1];
  const saved = await db.password_reset_token.findOne({ where: { userId: user.id } });
  assert.equal(saved.tokenHash, crypto.createHash('sha256').update(token).digest('hex'));
  assert.ok(!JSON.stringify(saved.toJSON()).includes(token));
  const concurrent = await Promise.all([request('/reset-password', { token, password: 'New password 123' }), request('/reset-password', { token, password: 'New password 123' })]);
  assert.deepEqual(concurrent.map((result) => result.status).sort(), [200, 400]);
  assert.equal((await request('/reset-password', { token, password: 'Another password 123' })).status, 400);
  assert.equal((await request('/login', { email: user.email, password: 'Old password 123' })).status, 401);
  const login = await request('/login', { email: user.email, password: 'New password 123' });
  assert.equal(login.status, 200);
  assert.equal((await request('/me', null, oldJwt)).status, 401);
  assert.equal((await request('/me', null, login.body.data.token)).status, 200);
  const expired = crypto.randomBytes(32).toString('hex');
  await db.password_reset_token.create({ userId: user.id, tokenHash: crypto.createHash('sha256').update(expired).digest('hex'), expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await request('/reset-password', { token: expired, password: 'Another password 123' })).status, 400);
  await user.update({ status: 'Suspended' });
  await resets.PasswordResetService.requestReset({ email: user.email });
  assert.equal(messages.length, 1);
  await user.update({ status: 'Active' });
  const reading = load(source('modules/reading/reading.service.js'), { '../../../models': db, ...errors });
  book = await db.book.create({ title: marker, page: 100 });
  const activity = await reading.ReadingService.startReading(user.id, { bookId: book.id });
  assert.equal(activity.currentPage, 0);
  await reading.ReadingService.updateActivity(activity.id, user.id, { currentPage: 42, privateNote: 'Fixture private note' });
  const reloaded = await db.reading_activity.findByPk(activity.id);
  assert.equal(reloaded.currentPage, 42);
  await assert.rejects(reloaded.update({ currentPage: -1 }));
  await assert.rejects(db.sequelize.query('UPDATE reading_activities SET "currentPage" = -1 WHERE id = :id', { replacements: { id: activity.id } }));
  assert.equal((await reloaded.reload()).currentPage, 42);
  const wishlist = load(source('modules/wishlists/wishlist.service.js'), { '../../../models': db, ...errors });
  const wish = await db.wishlist.create({ userId: user.id, bookId: book.id, visibility: 'Private', reason: 'Fixture note' });
  assert.equal((await wishlist.WishlistService.getUserPublicWishlistByUsername(user.username)).items.length, 0);
  await wish.update({ visibility: 'Public' });
  const publicShelf = await wishlist.WishlistService.getUserPublicWishlistByUsername(user.username);
  assert.equal(publicShelf.items.length, 1);
  assert.equal(publicShelf.items[0].bookId, book.id);
  assert.equal(publicShelf.user.email, undefined);
  await wish.destroy();
  const failedMail = load(source('modules/auth/password-reset.service.js'), {
    'node:crypto': crypto, '../../../models': db, bcryptjs: bcrypt, '../../errors/app-error': { AppError },
    '../../integrations/email/password-reset-mailer': { PasswordResetMailer: { getConfiguration() {}, send: async () => { throw new AppError('Mail unavailable', 503); } } },
  });
  await assert.rejects(failedMail.PasswordResetService.requestReset({ email: user.email }), (error) => error.statusCode === 503);
  assert.equal(await db.password_reset_token.count({ where: { userId: user.id } }), 0);
});
