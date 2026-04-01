const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const allowAdminAndPharmacist = authorizeRole('admin', 'pharmacist');

router.get('/', authenticateToken, allowAdminAndPharmacist, purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', authenticateToken, allowAdminAndPharmacist, purchaseOrderController.getPurchaseOrderById);
router.post('/', authenticateToken, allowAdminAndPharmacist, purchaseOrderController.createPurchaseOrder);
router.put('/:id/status', authenticateToken, allowAdminAndPharmacist, purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;
