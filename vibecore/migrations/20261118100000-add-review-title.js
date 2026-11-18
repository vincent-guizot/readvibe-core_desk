'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reading_activities', 'reviewTitle', { type: Sequelize.STRING(255), allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('reading_activities', 'reviewTitle');
  },
};
