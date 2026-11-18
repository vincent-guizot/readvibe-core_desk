import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Worker } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const require = createRequire(import.meta.url);
const estreeRequire = createRequire(require.resolve('@typescript-eslint/typescript-estree'));
const minimatchPath = estreeRequire.resolve('minimatch');
const { minimatch } = estreeRequire('minimatch');
const affected = (version) => {
  const [major, minor, patch] = version.split('.').map(Number);
  return major >= 7 && (major < 11 || (major === 11 && minor === 0 && patch === 0));
};

test('installed TypeScript ESLint resolver and lockfile exclude vulnerable minimatch 7–11.0.0', () => {
  assert.equal(affected(estreeRequire('minimatch/package.json').version), false);
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  for (const [name, pkg] of Object.entries(lock.packages)) {
    if (name.endsWith('/minimatch')) assert.equal(affected(pkg.version), false, `${name}: ${pkg.version}`);
  }
});

test('patched minimatch preserves recursive, extension and dotfile matching used by tooling', () => {
  for (const [name, pattern, options, expected] of [
    ['src/app/page.js', 'src/**/*.js', {}, true],
    ['src/components/Book.jsx', 'src/**/*.{js,jsx}', {}, true],
    ['src/components/Book.css', 'src/**/*.{js,jsx}', {}, false],
    ['src/.private/file.js', 'src/**/*.js', {}, false],
    ['src/.private/file.js', 'src/**/*.js', { dot: true }, true],
  ]) assert.equal(minimatch(name, pattern, options), expected, name);
});

test('amplifying glob preprocessing completes within a bounded worker', { timeout: 10000 }, async () => {
  assert.equal(affected(estreeRequire('minimatch/package.json').version), false);
  const worker = new Worker(`
    const { parentPort, workerData } = require('node:worker_threads');
    const { Minimatch } = require(workerData.modulePath);
    const matcher = new Minimatch('a/' + '**/../'.repeat(24) + 'target.js', { optimizationLevel: 2 });
    parentPort.postMessage(typeof matcher.match('a/target.js'));
  `, { eval: true, workerData: { modulePath: minimatchPath } });
  try {
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Glob preprocessing exceeded 5 seconds')), 5000);
      worker.once('message', (value) => { clearTimeout(timer); resolve(value); });
      worker.once('error', (error) => { clearTimeout(timer); reject(error); });
      worker.once('exit', (code) => { if (code !== 0) { clearTimeout(timer); reject(new Error(`Worker exited: ${code}`)); } });
    });
    assert.equal(result, 'boolean');
  } finally { await worker.terminate(); }
});

test('actual Next lint configuration still detects synchronous scripts and conditional hooks', async () => {
  const eslint = new ESLint({ cwd: fileURLToPath(new URL('..', import.meta.url)) });
  const [result] = await eslint.lintText(`
    import { useState } from 'react';
    export default function Demo({ show }) {
      if (show) useState(0);
      return <script src="/sync.js"></script>;
    }
  `, { filePath: 'src/dependency-security-fixture.jsx' });
  for (const rule of ['@next/next/no-sync-scripts', 'react-hooks/rules-of-hooks']) {
    assert.ok(result.messages.some((message) => message.ruleId === rule && message.severity === 2), rule);
  }
});
