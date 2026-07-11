const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const generateId = require('../utils/generateId');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => generateId('comp'),
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Company;
