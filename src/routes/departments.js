const { Router } = require('express');
const departmentController = require('../controllers/departmentController');
const authenticate = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', departmentController.list);
router.get('/:id', departmentController.getById);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

module.exports = router;
