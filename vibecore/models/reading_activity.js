'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class reading_activity extends Model {
    static associate(models) {
      reading_activity.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
      reading_activity.belongsTo(models.book, { foreignKey: 'bookId', as: 'book' });
    }
  }
  reading_activity.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'Want to Read', // 'Want to Read', 'Reading', 'Finished'
      },
      startDate: DataTypes.DATE,
      currentPage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { isInt: true, min: 0, max: 2147483647 },
      },
      finishDate: DataTypes.DATE,
      rating: DataTypes.INTEGER, // 1 - 5
      quote: DataTypes.TEXT,
      privateNote: DataTypes.TEXT,
      publicReview: DataTypes.TEXT,
      reviewTitle: DataTypes.STRING(255),
      reviewVisibility: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'Public', validate: { isIn: [['Public', 'Private']] } },
      moodTag: DataTypes.STRING,
      isSpoiler: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isFlagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      flagReason: DataTypes.STRING,
      moderationReason: DataTypes.TEXT,
      moderatedBy: DataTypes.INTEGER,
      moderationStatus: {
        type: DataTypes.STRING,
        defaultValue: 'Approved', // 'Approved', 'Pending', 'Rejected'
      },
    },
    {
      sequelize,
      modelName: 'reading_activity',
    }
  );
  return reading_activity;
};
