const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  // Database
  // databaseUrl: process.env.DATABASE_URL,

  // JWT
  // jwtSecret: process.env.JWT_SECRET,
  // jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = config;
