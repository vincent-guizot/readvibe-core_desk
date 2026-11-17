'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('application_setting', {
  id: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.JSONB, allowNull: false },
  updatedBy: DataTypes.INTEGER,
});
