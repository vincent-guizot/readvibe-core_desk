'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class genre extends Model {
    static associate(models) {
      genre.hasMany(models.book, { foreignKey: 'genreId', as: 'books' });
    }
  }
  genre.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'genre',
    }
  );
  return genre;
};
