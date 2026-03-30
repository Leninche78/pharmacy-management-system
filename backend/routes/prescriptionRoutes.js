const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Only pharmacists and admins should ideally manage prescriptions
router.post('/', authorizeRole('admin', 'pharmacist'), prescriptionController.createPrescription);
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/customer/:customerId', prescriptionController.getPrescriptionsByCustomerId);

module.exports = router;
