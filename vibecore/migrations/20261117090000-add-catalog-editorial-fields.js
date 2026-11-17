'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('authors', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('genres', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('authors', 'bio');
    await queryInterface.removeColumn('genres', 'description');
  },
};
