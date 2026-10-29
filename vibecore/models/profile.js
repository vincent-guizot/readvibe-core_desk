'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class profile extends Model {
    static associate(models) {
      profile.hasOne(models.user, { foreignKey: 'profileId', as: 'user' });
    }
  }
  profile.init(
    {
      fullname: DataTypes.STRING,
      image: DataTypes.STRING,
      age: DataTypes.INTEGER,
      nationality: DataTypes.STRING,
      gender: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'profile',
    }
  );
  return profile;
};
