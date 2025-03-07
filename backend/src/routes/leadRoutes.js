const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
  getCustomers,
} = require('../controllers/leadController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');

router.route('/').post(protect, createLead).get(protect, getLeads);
router.route('/stats').get(protect, getLeadStats);
router.route('/customers').get(protect, getCustomers);
router.route('/create').get((req, res) => {
  res.status(200).json({ message: 'Use POST to /api/leads to create a new lead' });
});
router
  .route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, checkRole(['admin', 'manager']), deleteLead);

module.exports = router;