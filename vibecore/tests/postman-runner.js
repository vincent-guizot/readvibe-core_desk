const { execFile } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const createQaApi = require('./helpers/qa-api');

async function run() {
  const qa = await createQaApi();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vibecore-postman-'));
  try {
    const values = [{ key: 'baseUrl', value: qa.baseUrl, enabled: true }, { key: 'fixturePassword', value: qa.accounts.member.password, enabled: true }];
    for (const [role, account] of Object.entries(qa.accounts)) {
      values.push({ key: `${role}Email`, value: account.email, enabled: true }, { key: `${role}Password`, value: account.password, enabled: true });
    }
    const environment = path.join(directory, 'environment.json');
    fs.writeFileSync(environment, JSON.stringify({ name: 'Disposable local QA', values, _postman_variable_scope: 'environment' }));
    await new Promise((resolve, reject) => execFile(process.platform === 'win32' ? 'postman.exe' : 'postman', [
      'collection', 'run', path.resolve(__dirname, '../postman/VibeCore.postman_collection.json'),
      '-e', environment, '-i', 'CRUD Regression', '--no-report-events',
    ], { timeout: 120000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout, stderr) => {
      process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (error) reject(new Error(`Postman failed (${error.code || 'execution error'}).`));
      else resolve();
    }));
  } finally {
    try { await qa.close(); }
    finally {
      if (path.dirname(path.resolve(directory)) === path.resolve(os.tmpdir()) && path.basename(directory).startsWith('vibecore-postman-')) fs.rmSync(directory, { recursive: true, force: true });
    }
  }
}
run().catch((error) => { console.error(error.message); process.exitCode = 1; });
