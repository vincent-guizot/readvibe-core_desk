const test = require('node:test');
const assert = require('node:assert/strict');
const createQaApi = require('./helpers/qa-api');

test('disposable QA harness refuses production mode and non-local database hosts before connecting', async () => {
  const original = { NODE_ENV: process.env.NODE_ENV, DB_HOST: process.env.DB_HOST };
  const configPath = require.resolve('../config/database');
  try {
    process.env.NODE_ENV = 'production';
    await assert.rejects(createQaApi(), /non-production environment/);
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'remote.example.invalid';
    delete require.cache[configPath];
    await assert.rejects(createQaApi(), /host must be localhost/);
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    delete require.cache[configPath];
  }
});
