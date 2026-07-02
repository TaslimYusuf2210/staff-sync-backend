const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.isDev ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('⚠️  Unable to connect to the database:', error.message);
    console.error('   The server will start but DB features will be unavailable.');
    console.error('   Make sure MySQL is running and create the database:');
    console.error(`   > CREATE DATABASE IF NOT EXISTS ${config.db.name};`);
    return false;
  }
};

module.exports = { sequelize, testConnection };
