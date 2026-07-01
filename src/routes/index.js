const { Router } = require('express');
const healthRoutes = require('./health');

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Future routes can be added here:
// router.use('/users', require('./users'));
// router.use('/employees', require('./employees'));

module.exports = router;
