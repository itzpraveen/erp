const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getProposalStats,
  submitProposal,
  managerApproveProposal,
  adminApproveProposal,
  requestAdjustments,
  implementAdjustments,
} = require('../controllers/proposalController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');

// Base routes
router.route('/').post(protect, createProposal).get(protect, getProposals);
router.route('/stats').get(protect, getProposalStats);

// Proposal approval workflow routes
router.route('/:id/submit').post(protect, submitProposal);
router.route('/:id/manager-approve').post(protect, checkRole(['admin', 'manager']), managerApproveProposal);
router.route('/:id/admin-approve').post(protect, admin, adminApproveProposal);
router.route('/:id/request-adjustments').post(protect, checkRole(['admin', 'manager']), requestAdjustments);
router.route('/:id/implement-adjustments').post(protect, implementAdjustments);

// Standard CRUD routes
router
  .route('/:id')
  .get(protect, getProposalById)
  .put(protect, updateProposal)
  .delete(protect, checkRole(['admin', 'manager']), deleteProposal);

module.exports = router;