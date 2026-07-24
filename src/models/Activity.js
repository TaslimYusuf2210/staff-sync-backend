const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const generateId = require('../utils/generateId');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => generateId('act'),
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'employee',
      'employee_delete',
      'department',
      'department_edit',
      'note',
      'document',
      'education',
      'salary'
    ),
    allowNull: false,
  },
  companyId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Activity;
