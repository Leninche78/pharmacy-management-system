const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Must be logged in

// Everyone can read settings (for receipts etc)
router.get('/', settingController.getSettings);

// Only admins can modify system settings
router.put('/', authorizeRole('admin'), settingController.updateSettings);

module.exports = router;
