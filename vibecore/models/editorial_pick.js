'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class editorial_pick extends Model {
    static associate(models) {
      editorial_pick.belongsTo(models.book, { foreignKey: 'bookId', as: 'book' });
    }
  }
  editorial_pick.init(
    {
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tagline: DataTypes.STRING,
      curatorNotes: DataTypes.TEXT,
      curationWeight: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'editorial_pick',
    }
  );
  return editorial_pick;
};
