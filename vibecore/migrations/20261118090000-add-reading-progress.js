'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('reading_activities', 'currentPage', {
        type: Sequelize.INTEGER, allowNull: false, defaultValue: 0,
      }, { transaction });
      await queryInterface.addConstraint('reading_activities', {
        fields: ['currentPage'], type: 'check', name: 'reading_activities_current_page_nonnegative',
        where: { currentPage: { [Sequelize.Op.gte]: 0 } }, transaction,
      });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeConstraint('reading_activities', 'reading_activities_current_page_nonnegative', { transaction });
      await queryInterface.removeColumn('reading_activities', 'currentPage', { transaction });
    });
  },
};
