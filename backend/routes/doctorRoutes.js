const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const allowAdminAndPharmacist = authorizeRole('admin', 'pharmacist');

router.get('/', authenticateToken, allowAdminAndPharmacist, doctorController.getAllDoctors);
router.get('/:id', authenticateToken, allowAdminAndPharmacist, doctorController.getDoctorById);
router.post('/', authenticateToken, allowAdminAndPharmacist, doctorController.createDoctor);
router.put('/:id', authenticateToken, allowAdminAndPharmacist, doctorController.updateDoctor);
router.delete('/:id', authenticateToken, allowAdminAndPharmacist, doctorController.deleteDoctor);

module.exports = router;
