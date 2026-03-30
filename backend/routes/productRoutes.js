const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, productController.getAllProducts);
router.get('/:id', authenticateToken, productController.getProductById);

// Only admins and pharmacists can modify inventory
router.post('/', authenticateToken, authorizeRole('admin', 'pharmacist'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRole('admin', 'pharmacist'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorizeRole('admin'), productController.deleteProduct);

module.exports = router;
