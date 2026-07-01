const app = require('./src/app');
const config = require('./src/config');

const start = () => {
  app.listen(config.port, () => {
    console.log(`🚀 StaffSync server running on port ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health: http://localhost:${config.port}/api/health`);
  });
};

start();
