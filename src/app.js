const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Global Middleware ───────────────────────────────────────

// HTTP request logging
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// CORS
app.use(cors({ origin: config.cors.origin }));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ─── Static Files (for uploads) ──────────────────────────────

app.use('/uploads', express.static(config.upload.uploadDir));

// ─── Swagger Docs ────────────────────────────────────────────

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'StaffSync API Docs',
}));

// ─── Routes ──────────────────────────────────────────────────

app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;
