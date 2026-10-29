'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class author extends Model {
    static associate(models) {
      author.hasMany(models.book, { foreignKey: 'authorId', as: 'books' });
      author.belongsTo(models.profile, { foreignKey: 'profileId', as: 'profile' });
    }
  }
  author.init(
    {
      pen_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'author',
    }
  );
  return author;
};
