'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('profiles', 'bio', { type: Sequelize.TEXT, allowNull: true }, { transaction });
      await queryInterface.addColumn('profiles', 'location', { type: Sequelize.STRING(255), allowNull: true }, { transaction });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('profiles', 'location', { transaction });
      await queryInterface.removeColumn('profiles', 'bio', { transaction });
    });
  },
};
