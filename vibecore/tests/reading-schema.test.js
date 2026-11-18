const assert = require('node:assert/strict');
const test = require('node:test');
const { Sequelize, DataTypes } = require('sequelize');
const progressMigration = require('../migrations/20261118090000-add-reading-progress');
const tokenMigration = require('../migrations/20261118091000-create-password-reset-tokens');

test('migrations add and reverse progress and token schema within transactions', async () => {
  const transaction = {};
  const operations = [];
  const qi = { sequelize: { transaction: async (run) => run(transaction) } };
  for (const method of ['addColumn', 'addConstraint', 'removeConstraint', 'removeColumn', 'createTable', 'addIndex', 'dropTable']) {
    qi[method] = async (...args) => {
      assert.equal(args.at(-1).transaction, transaction);
      operations.push([method, ...args]);
    };
  }
  await progressMigration.up(qi, Sequelize);
  const column = operations.find(([method]) => method === 'addColumn');
  assert.equal(column[1], 'reading_activities');
  assert.equal(column[2], 'currentPage');
  assert.equal(column[3].defaultValue, 0);
  assert.equal(column[3].allowNull, false);
  assert.equal(operations[1][2].where.currentPage[Sequelize.Op.gte], 0);
  await tokenMigration.up(qi, Sequelize);
  const table = operations.find(([method]) => method === 'createTable');
  assert.equal(table[1], 'password_reset_tokens');
  assert.deepEqual(table[2].userId.references, { model: 'users', key: 'id' });
  assert.equal(table[2].userId.onDelete, 'CASCADE');
  assert.equal(table[2].tokenHash.unique, true);
  assert.equal(table[2].tokenHash.type.toString(), 'VARCHAR(64)');
  assert.equal(table[2].expiresAt.allowNull, false);
  assert.equal(table[2].usedAt.allowNull, true);
  assert.deepEqual(operations.find(([method]) => method === 'addIndex')[2], ['userId']);
  await tokenMigration.down(qi);
  await progressMigration.down(qi);
  assert.deepEqual(operations.slice(-3).map(([method]) => method), ['dropTable', 'removeConstraint', 'removeColumn']);
});

test('models validate progress and hashed tokens and expose matching associations', async () => {
  const sequelize = new Sequelize('unused', 'unused', 'unused', { dialect: 'postgres', logging: false });
  try {
    const models = {};
    for (const name of ['user', 'profile', 'wishlist', 'reading_activity', 'book', 'password_reset_token']) {
      models[name] = require(`../models/${name}`)(sequelize, DataTypes);
    }
    models.user.associate(models);
    models.password_reset_token.associate(models);
    assert.equal(models.user.associations.passwordResetTokens.target, models.password_reset_token);
    assert.equal(models.password_reset_token.associations.user.target, models.user);
    assert.equal(models.password_reset_token.getTableName(), 'password_reset_tokens');
    assert.equal(models.reading_activity.build({ userId: 1, bookId: 10 }).currentPage, 0);
    for (const currentPage of [-1, 1.5, null, 2147483648]) {
      await assert.rejects(models.reading_activity.build({ userId: 1, bookId: 10, currentPage }).validate());
    }
    const values = { userId: 1, tokenHash: 'a'.repeat(64), expiresAt: new Date(Date.now() + 60000) };
    await models.password_reset_token.build(values).validate();
    for (const tokenHash of ['raw-token', 'g'.repeat(64), null]) {
      await assert.rejects(models.password_reset_token.build({ ...values, tokenHash }).validate());
    }
    await assert.rejects(models.password_reset_token.build({ ...values, expiresAt: null }).validate());
    assert.equal(Object.hasOwn(models.password_reset_token.rawAttributes, 'token'), false);
  } finally {
    await sequelize.close();
  }
});
