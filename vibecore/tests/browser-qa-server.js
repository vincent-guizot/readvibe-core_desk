const createQaApi = require('./helpers/qa-api');

(async () => {
  if (!process.stdin.isTTY) throw new Error('Run this browser QA server in an interactive terminal so quit can clean up its database.');
  const qa = await createQaApi();
  console.log(JSON.stringify({ baseUrl: qa.baseUrl, database: qa.database, accounts: qa.accounts }));
  console.log('Disposable QA server ready. Type quit and Enter to remove its database.');
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    await qa.close();
    console.log('QA server, database and cover storage removed.');
    process.exit(0);
  };
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (input) => { if (input.trim() === 'quit') close().catch((error) => { console.error(error); process.exit(1); }); });
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
})().catch((error) => { console.error(error); process.exit(1); });
