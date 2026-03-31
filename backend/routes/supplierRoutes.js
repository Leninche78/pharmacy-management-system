const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, supplierController.getAllSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplierById);
router.post('/', authenticateToken, supplierController.createSupplier);
router.put('/:id', authenticateToken, supplierController.updateSupplier);
router.delete('/:id', authenticateToken, supplierController.deleteSupplier);

module.exports = router;
