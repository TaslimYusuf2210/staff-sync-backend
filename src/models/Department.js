const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const generateId = require('../utils/generateId');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => generateId('dep'),
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  head: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Not assigned',
  },
  dateCreated: {
    type: DataTypes.DATEONLY,
    defaultValue: () => new Date().toISOString().split('T')[0],
  },
});

module.exports = Department;
