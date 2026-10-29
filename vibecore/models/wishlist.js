'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class wishlist extends Model {
    static associate(models) {
      wishlist.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
      wishlist.belongsTo(models.book, { foreignKey: 'bookId', as: 'book' });
    }
  }
  wishlist.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING,
        defaultValue: 'Medium', // Low, Medium, High
      },
      reason: DataTypes.TEXT,
      visibility: {
        type: DataTypes.STRING,
        defaultValue: 'Public', // Public, Private
      },
    },
    {
      sequelize,
      modelName: 'wishlist',
    }
  );
  return wishlist;
};
