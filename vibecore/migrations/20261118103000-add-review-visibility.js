'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reading_activities', 'reviewVisibility', { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'Public' });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('reading_activities', 'reviewVisibility');
  },
};
