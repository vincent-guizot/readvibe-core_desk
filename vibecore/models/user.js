'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      user.belongsTo(models.profile, { foreignKey: 'profileId', as: 'profile' });
      user.hasMany(models.wishlist, { foreignKey: 'userId', as: 'wishlists' });
      user.hasMany(models.reading_activity, { foreignKey: 'userId', as: 'readingActivities' });
    }
  }
  user.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'Member', // Member, Librarian, Admin
      },
      profileId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'user',
    }
  );
  return user;
};
