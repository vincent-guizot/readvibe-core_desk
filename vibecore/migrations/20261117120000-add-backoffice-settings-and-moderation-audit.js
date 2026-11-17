'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('application_settings', {
        id: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
        value: { type: Sequelize.JSONB, allowNull: false },
        updatedBy: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      }, { transaction });
      await queryInterface.addColumn('reading_activities', 'moderationReason', { type: Sequelize.TEXT, allowNull: true }, { transaction });
      await queryInterface.addColumn('reading_activities', 'moderatedBy', { type: Sequelize.INTEGER, allowNull: true }, { transaction });
    });
  },
  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('reading_activities', 'moderatedBy', { transaction });
      await queryInterface.removeColumn('reading_activities', 'moderationReason', { transaction });
      await queryInterface.dropTable('application_settings', { transaction });
    });
  },
};
