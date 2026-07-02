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
  db: {
    name: process.env.DB_NAME || 'staffsync',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'staffsync-dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/gif',
    ],
    uploadDir: path.resolve(__dirname, '../../uploads'),
  },
};

module.exports = config;
