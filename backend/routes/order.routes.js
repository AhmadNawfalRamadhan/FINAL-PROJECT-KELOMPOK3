const router = require('express').Router();

const controller = require('../controllers/order.controller');

const { requireAdmin } = require('../middleware/auth');

// Customer checkout
router.post('/', controller.create);

// Admin
router.get('/', requireAdmin, controller.list);

router.get('/:id', requireAdmin, controller.detail);

router.patch(
  '/:id/status',
  requireAdmin,
  controller.updateStatus
);

router.get(
  '/track/:orderNumber',
  controller.track
);

// Hapus invoice
router.delete(
  '/:id',
  requireAdmin,
  controller.delete
);

module.exports = router;