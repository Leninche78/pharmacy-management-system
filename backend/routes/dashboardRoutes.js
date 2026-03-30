const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// All dashboard routes should be protected, but we can assume they run under a protected path or we can add middleware.
// For now, mirroring existing route patterns minus auth.
// If there's an protect middleware, we might need to add it: const { protect } = require('../middleware/authMiddleware');
router.get('/stats', getDashboardStats);

module.exports = router;
