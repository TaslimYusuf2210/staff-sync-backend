const { Router } = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getMe);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
