const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all sale routes

router.post('/', saleController.createSale);
router.get('/export', saleController.exportSalesCSV);
router.get('/', saleController.getAllSales);

module.exports = router;
