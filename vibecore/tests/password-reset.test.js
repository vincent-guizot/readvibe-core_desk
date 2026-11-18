const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = require('./helpers/load-module');
const source = (file) => path.join(__dirname, '../src', file);
const { AppError } = load(source('errors/app-error.js'));

test('password recovery rejects malformed input and bcrypt-truncated passwords', () => {
  const validators = load(source('modules/auth/auth.validator.js'), {}, { Buffer });
  for (const email of ['', null, [], 'bad', 'a\r\nb@example.com', 'x'.repeat(255)]) assert.ok(validators.validateForgotPassword({ body: { email } }));
  assert.equal(validators.validateForgotPassword({ body: { email: ' reader@example.com ' } }), null);
  const token = 'a'.repeat(64);
  for (const password of [null, [], 'short', 'x'.repeat(73), '🔐'.repeat(20)]) assert.ok(validators.validateResetPassword({ body: { token, password } }));
  assert.ok(validators.validateResetPassword({ body: { token: 'raw', password: 'a'.repeat(12) } }));
  assert.equal(validators.validateResetPassword({ body: { token, password: 'a'.repeat(12) } }), null);
});

test('SMTP failures are explicit, safe, and never expose reset tokens or provider credentials', async () => {
  let closed = false;
  const { PasswordResetMailer } = load(source('integrations/email/password-reset-mailer.js'), {
    nodemailer: { createTransport: (options) => {
      assert.equal(options.requireTLS, true);
      assert.equal(options.auth.pass, 'fixture-secret');
      return { sendMail: async () => { throw new Error('fixture-secret'); }, close: () => { closed = true; } };
    } },
    '../../config/env': { ENV: { NODE_ENV: 'production', READVIBE_URL: 'https://reader.example', SMTP: { HOST: 'smtp.example', FROM: 'reader@example.com', PORT: 587, USER: 'fixture', PASSWORD: 'fixture-secret' } } },
    '../../errors/app-error': { AppError },
  }, { URL });
  await assert.rejects(PasswordResetMailer.send('reader@example.com', 'a'.repeat(64)), (error) => error.statusCode === 503 && !error.message.includes('fixture-secret') && !error.message.includes('a'.repeat(64)));
  assert.equal(closed, true);
});

test('reset rate limiter rejects the sixth request and sets retry information', () => {
  const { passwordResetRateLimit } = load(source('middlewares/password-reset-rate-limit.js'), { '../errors/app-error': { AppError } });
  const limiter = passwordResetRateLimit();
  let retry;
  for (let i = 0; i < 6; i++) limiter({ ip: 'fixture' }, { set: (key, value) => { retry = value; } }, (error) => {
    assert.equal(error?.statusCode, i === 5 ? 429 : undefined);
  });
  assert.ok(retry > 0);
});

test('unconfigured mail fails before account lookup instead of claiming a reset email was sent', async () => {
  let queried = false;
  const { PasswordResetService } = load(source('modules/auth/password-reset.service.js'), {
    'node:crypto': require('node:crypto'), bcryptjs: require('bcryptjs'),
    '../../../models': { sequelize: { transaction: async () => { queried = true; } } },
    '../../errors/app-error': { AppError },
    '../../integrations/email/password-reset-mailer': { PasswordResetMailer: { getConfiguration: () => { throw new AppError('Unavailable', 503); } } },
  });
  await assert.rejects(PasswordResetService.requestReset({ email: 'reader@example.com' }), (error) => error.statusCode === 503);
  assert.equal(queried, false);
});
