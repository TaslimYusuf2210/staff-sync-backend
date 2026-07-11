const { Router } = require('express');
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/company', settingsController.updateCompany);

module.exports = router;
