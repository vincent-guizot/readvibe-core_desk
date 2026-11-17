import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readSession,
  saveSession,
  clearSession,
} from '../src/features/auth/session.js';

test('staff sessions respect remember choice, clear both stores, and reject corrupt or Member state', () => {
  const storage = () => {
    const data = new Map();
    return {
      getItem: (key) => data.get(key) || null,
      setItem: (key, value) => data.set(key, value),
      removeItem: (key) => data.delete(key),
    };
  };
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
  const admin = { id: 1, role: 'Admin' };
  saveSession('test-token', admin, false);
  assert.equal(localStorage.getItem('vibedesk_token'), null);
  assert.equal(sessionStorage.getItem('vibedesk_token'), 'test-token');
  assert.equal(readSession().user.role, 'Admin');
  saveSession('remembered-test-token', admin, true);
  assert.equal(sessionStorage.getItem('vibedesk_token'), null);
  assert.equal(localStorage.getItem('vibedesk_token'), 'remembered-test-token');
  clearSession();
  assert.deepEqual(readSession(), { token: null, user: null });
  localStorage.setItem('vibedesk_token', 'invalid-user-test');
  localStorage.setItem('vibedesk_user', '{broken');
  assert.equal(readSession().user, null);
  localStorage.setItem('vibedesk_user', JSON.stringify({ role: 'Member' }));
  assert.equal(readSession().token, null);
  clearSession();
  delete globalThis.localStorage;
  delete globalThis.sessionStorage;
});
