'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const field of ['username', 'email']) {
        const [duplicates] = await queryInterface.sequelize.query(`SELECT COUNT(*) FROM (SELECT "${field}" FROM "users" WHERE "${field}" IS NOT NULL GROUP BY "${field}" HAVING COUNT(*) > 1) AS duplicates`, { transaction });
        if (Number(duplicates[0].count)) throw new Error(`Cannot enforce unique ${field}: duplicate identities must be resolved first. No records were changed.`);
        await queryInterface.addConstraint('users', { fields: [field], type: 'unique', name: `users_${field}_identity_unique`, transaction });
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const field of ['username', 'email']) await queryInterface.removeConstraint('users', `users_${field}_identity_unique`, { transaction });
    });
  },
};
