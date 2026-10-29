'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class book_mood extends Model {
    static associate(models) {
      book_mood.belongsTo(models.book, { foreignKey: 'bookId' });
      book_mood.belongsTo(models.mood_tag, { foreignKey: 'moodTagId' });
    }
  }
  book_mood.init(
    {
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      moodTagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'book_mood',
    }
  );
  return book_mood;
};
