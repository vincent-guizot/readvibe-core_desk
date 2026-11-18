const { Sequelize } = require('sequelize');
const { randomUUID, randomBytes } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bcrypt = require('bcryptjs');

// A new database and actual migrations keep these tests independent of seed data.
module.exports = async function createQaApi() {
  const root = path.resolve(__dirname, '../..');
  const config = require('../../config/database').development;
  if (process.env.NODE_ENV === 'production') throw new Error('QA is restricted to a local non-production environment.');
  if (!['localhost', '127.0.0.1', '::1'].includes(config.host)) throw new Error('QA database host must be localhost.');
  const database = `vibecore_qa_${randomUUID().replaceAll('-', '')}`;
  const admin = new Sequelize({ ...config, database: 'postgres', logging: false });
  let created = false, db, server, storage;
  const close = async () => {
    try {
      if (server) await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
      if (db) await db.sequelize.close();
      if (created) await admin.query(`DROP DATABASE "${database}"`);
    } finally {
      await admin.close();
      if (storage && path.dirname(path.resolve(storage)) === path.resolve(os.tmpdir()) && path.basename(storage).startsWith('vibecore-qa-')) fs.rmSync(storage, { recursive: true, force: true });
    }
  };
  try {
    await admin.query(`CREATE DATABASE "${database}"`);
    created = true;
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME_TEST = database;
    delete require.cache[require.resolve('../../config/database')];
    process.env.JWT_SECRET = randomBytes(48).toString('hex');
    process.env.GEMINI_API_KEY = '';
    process.env.GOOGLE_BOOKS_API_KEY = '';
    process.env.SMTP_HOST = '';
    storage = fs.mkdtempSync(path.join(os.tmpdir(), 'vibecore-qa-'));
    process.env.BOOK_COVER_STORAGE_DIR = storage;
    execFileSync(process.execPath, [require.resolve('sequelize-cli/lib/sequelize'), 'db:migrate', '--env', 'test'], {
      cwd: root, env: process.env, stdio: 'pipe', timeout: 30000,
    });
    require('@babel/register')({
      only: [path.join(root, 'src')], babelrc: false, configFile: false,
      presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]],
    });
    db = require('../../models');
    const password = randomBytes(18).toString('base64url');
    const hash = await bcrypt.hash(password, 4);
    const accounts = {};
    for (const [key, role] of [['admin', 'Admin'], ['librarian', 'Librarian'], ['member', 'Member'], ['other', 'Member']]) {
      const profile = await db.profile.create({ fullname: `QA ${key}` });
      const user = await db.user.create({ username: `qa-${key}`, email: `${key}@qa.example.invalid`, password: hash, role, status: 'Active', profileId: profile.id });
      accounts[key] = { id: user.id, email: user.email, username: user.username, role, password };
    }
    const { logger } = require('../../src/utils/logger');
    logger.error = () => {}; // Expected negative-path requests remain asserted below.
    const app = require('../../src/app').default;
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    return { baseUrl, db, accounts, database, close };
  } catch (error) {
    await close();
    throw error;
  }
};
