const { Router } = require('express');
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/employee-summary', reportController.employeeSummary);
router.get('/salary-summary', reportController.salarySummary);
router.get('/hiring-trend', reportController.hiringTrend);
router.get('/export', reportController.exportReport);

module.exports = router;
