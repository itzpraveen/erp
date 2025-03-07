/**
 * Health routes for monitoring the health of the application
 */
const express = require('express');
const router = express.Router();
const { getHealth, getAuthTest } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

// Public health route
router.get('/', getHealth);

// Protected health route for authentication testing
router.get('/auth', protect, getAuthTest);

module.exports = router;