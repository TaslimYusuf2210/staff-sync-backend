const { Router } = require('express');
const departmentController = require('../controllers/departmentController');
const positionController = require('../controllers/positionController');
const authenticate = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// ─── Department CRUD ────────────────────────────────────────

router.get('/', departmentController.list);
router.get('/employee-count', departmentController.employeeCount);
router.get('/:id', departmentController.getById);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

// ─── Department Positions (nested resource) ─────────────────

router.get('/:departmentId/positions/stats', positionController.stats);
router.get('/:departmentId/positions', positionController.list);
router.post('/:departmentId/positions', positionController.create);
router.put('/:departmentId/positions/:positionId', positionController.update);
router.delete('/:departmentId/positions/:positionId', positionController.remove);

module.exports = router;
