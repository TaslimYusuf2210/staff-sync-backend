const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = BankAccount;
