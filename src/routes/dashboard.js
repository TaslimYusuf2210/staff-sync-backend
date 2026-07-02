const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);

module.exports = router;
