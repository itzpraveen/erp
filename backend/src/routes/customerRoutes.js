const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
  getCustomerStats,
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
// No public routes for customers

// Protected routes
router.route('/')
  .post(protect, createCustomer)
  .get(protect, getCustomers);

router.route('/stats').get(protect, getCustomerStats);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, admin, deleteCustomer);

router.route('/:id/history').get(protect, getCustomerHistory);

module.exports = router;