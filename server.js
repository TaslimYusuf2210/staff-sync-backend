const app = require('./src/app');
const config = require('./src/config');
const { sequelize, testConnection } = require('./src/config/database');

// Load models to register them with Sequelize before syncing
require('./src/models');

const start = async () => {
  const dbConnected = await testConnection();

  if (dbConnected) {
    // Sync models with database.
    // - Production: only creates missing tables, never alters (safe).
    // - Development: uses alter to add new columns, but won't drop data.
    await sequelize.sync({ alter: config.isDev });
    console.log('✅ Database tables synced');
  }

  app.listen(config.port, () => {
    console.log(`🚀 StaffSync server running on port ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health: http://localhost:${config.port}/api/health`);
  });
};

start();
