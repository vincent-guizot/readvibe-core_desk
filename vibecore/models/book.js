'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class book extends Model {
    static associate(models) {
      book.belongsTo(models.author, { foreignKey: 'authorId', as: 'author' });
      book.belongsTo(models.genre, { foreignKey: 'genreId', as: 'genre' });
      book.belongsTo(models.user, { foreignKey: 'userId', as: 'creator' });
      book.belongsToMany(models.mood_tag, {
        through: models.book_mood,
        foreignKey: 'bookId',
        otherKey: 'moodTagId',
        as: 'moods',
      });
      book.hasMany(models.editorial_pick, { foreignKey: 'bookId', as: 'editorialPicks' });
      book.hasMany(models.wishlist, { foreignKey: 'bookId', as: 'wishlists' });
      book.hasMany(models.reading_activity, { foreignKey: 'bookId', as: 'reviews' });
    }
  }
  book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      year: DataTypes.INTEGER,
      page: DataTypes.INTEGER,
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      price: DataTypes.INTEGER,
      image: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: 'Available',
      },
      isbn: DataTypes.STRING,
      googleBooksId: DataTypes.STRING,
      previewLink: DataTypes.TEXT,
      embeddable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      authorId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      genreId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'book',
    }
  );
  return book;
};
