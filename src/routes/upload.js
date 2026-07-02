const { Router } = require('express');
const uploadController = require('../controllers/uploadController');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
