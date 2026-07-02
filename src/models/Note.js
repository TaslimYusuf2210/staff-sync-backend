const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const generateId = require('../utils/generateId');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => generateId('n'),
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdDate: {
    type: DataTypes.DATEONLY,
    defaultValue: () => new Date().toISOString().split('T')[0],
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Note;
