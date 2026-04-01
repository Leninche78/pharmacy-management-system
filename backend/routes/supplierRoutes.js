const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const allowAdmin = authorizeRole('admin');

router.get('/', authenticateToken, allowAdmin, supplierController.getAllSuppliers);
router.get('/:id', authenticateToken, allowAdmin, supplierController.getSupplierById);
router.post('/', authenticateToken, allowAdmin, supplierController.createSupplier);
router.put('/:id', authenticateToken, allowAdmin, supplierController.updateSupplier);
router.delete('/:id', authenticateToken, allowAdmin, supplierController.deleteSupplier);

module.exports = router;
