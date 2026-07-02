const { Router } = require('express');
const healthRoutes = require('./health');
const authRoutes = require('./auth');
const employeeRoutes = require('./employees');
const departmentRoutes = require('./departments');
const dashboardRoutes = require('./dashboard');
const reportRoutes = require('./reports');
const settingsRoutes = require('./settings');
const uploadRoutes = require('./upload');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
