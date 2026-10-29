'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class mood_tag extends Model {
    static associate(models) {
      mood_tag.belongsToMany(models.book, {
        through: models.book_mood,
        foreignKey: 'moodTagId',
        otherKey: 'bookId',
        as: 'books',
      });
    }
  }
  mood_tag.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      icon: DataTypes.STRING,
      color: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'mood_tag',
    }
  );
  return mood_tag;
};
