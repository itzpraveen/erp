/**
 * Test routes for debugging
 */
const express = require('express');
const router = express.Router();
const { testEndpoint, testUsers } = require('../controllers/testController');

// Test routes (no authentication required)
router.get('/', testEndpoint);
router.get('/users', testUsers);

module.exports = router;