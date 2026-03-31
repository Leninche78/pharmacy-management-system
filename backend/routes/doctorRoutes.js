const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, doctorController.getAllDoctors);
router.get('/:id', authenticateToken, doctorController.getDoctorById);
router.post('/', authenticateToken, authorizeRole('admin', 'pharmacist'), doctorController.createDoctor);
router.put('/:id', authenticateToken, authorizeRole('admin', 'pharmacist'), doctorController.updateDoctor);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'pharmacist'), doctorController.deleteDoctor);

module.exports = router;
