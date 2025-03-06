const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getProposalStats,
} = require('../controllers/proposalController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../config/cache/redis');

// Cache proposal list for 5 minutes
router.route('/').post(protect, createProposal).get(protect, cacheMiddleware(300), getProposals);

// Cache proposal stats for 30 minutes
router.route('/stats').get(protect, cacheMiddleware(1800), getProposalStats);

router
  .route('/:id')
  .get(protect, getProposalById)
  .put(protect, updateProposal)
  .delete(protect, checkRole(['admin', 'manager']), deleteProposal);

module.exports = router;