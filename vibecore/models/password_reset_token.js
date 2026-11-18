'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class password_reset_token extends Model {
    static associate(models) {
      password_reset_token.belongsTo(models.user, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    }
  }
  password_reset_token.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, validate: { is: /^[a-f0-9]{64}$/ } },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: true },
  }, { sequelize, modelName: 'password_reset_token', indexes: [{ fields: ['userId'] }] });
  return password_reset_token;
};
