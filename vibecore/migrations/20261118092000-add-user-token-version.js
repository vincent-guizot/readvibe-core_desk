'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('users', 'tokenVersion', {
        type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
      }, { transaction });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('users', 'tokenVersion', { transaction });
    });
  },
};
