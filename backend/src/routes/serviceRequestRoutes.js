const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  assignServiceRequest,
  updateServiceRequestStatus,
  addServiceRequestParts,
  addCustomerFeedback,
  getServiceRequestStats,
} = require('../controllers/serviceRequestController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');

router.route('/').post(protect, createServiceRequest).get(protect, getServiceRequests);

router
  .route('/stats')
  .get(protect, checkRole(['admin', 'manager']), getServiceRequestStats);

router
  .route('/:id')
  .get(protect, getServiceRequestById)
  .put(protect, updateServiceRequest);

router
  .route('/:id/assign')
  .put(protect, checkRole(['admin', 'manager']), assignServiceRequest);

router.route('/:id/status').put(protect, updateServiceRequestStatus);

router.route('/:id/parts').post(protect, addServiceRequestParts);

router.route('/:id/feedback').post(protect, addCustomerFeedback);

module.exports = router;