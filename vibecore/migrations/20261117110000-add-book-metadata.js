'use strict';

const textColumns = { subtitle: 255, publisher: 255, edition: 100, language: 100, format: 50 };
const dimensionColumns = ['widthCm', 'heightCm'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const [name, length] of Object.entries(textColumns)) {
        await queryInterface.addColumn('books', name, { type: Sequelize.STRING(length), allowNull: true }, { transaction });
      }
      for (const name of dimensionColumns) {
        await queryInterface.addColumn('books', name, { type: Sequelize.DECIMAL(8, 2), allowNull: true }, { transaction });
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const name of [...dimensionColumns, ...Object.keys(textColumns)].reverse()) {
        await queryInterface.removeColumn('books', name, { transaction });
      }
    });
  },
};
