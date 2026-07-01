/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and returns a consistent response.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
