const { spawnSync } = require('node:child_process');

const result = spawnSync(process.execPath, [
  '--test', 'tests/crud-rbac.db.test.js', 'tests/crud-validation.db.test.js', 'tests/cross-client.db.test.js',
], { stdio: 'inherit', env: { ...process.env, RUN_CRUD_DB_TESTS: '1' } });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
