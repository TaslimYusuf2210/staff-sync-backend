const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────

app.use('/api', routes);

// ─── Error Handling ──────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;
