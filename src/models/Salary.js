const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Salary = sequelize.define('Salary', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  baseSalary: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  bonus: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  allowances: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Salary;
