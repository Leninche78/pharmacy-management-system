const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', authenticateToken, purchaseOrderController.getPurchaseOrderById);
router.post('/', authenticateToken, purchaseOrderController.createPurchaseOrder);
router.put('/:id/status', authenticateToken, purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;
