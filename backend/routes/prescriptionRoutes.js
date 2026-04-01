const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

const allowAdminAndPharmacist = authorizeRole('admin', 'pharmacist');

router.post('/', allowAdminAndPharmacist, prescriptionController.createPrescription);
router.get('/', allowAdminAndPharmacist, prescriptionController.getAllPrescriptions);
router.get('/customer/:customerId', allowAdminAndPharmacist, prescriptionController.getPrescriptionsByCustomerId);

module.exports = router;
