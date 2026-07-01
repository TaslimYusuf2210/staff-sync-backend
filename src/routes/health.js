const { Router } = require('express');

const router = Router();

/**
 * GET /api/health
 * Health-check endpoint.
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'StaffSync API is running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
