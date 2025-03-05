const express = require('express');
const router = express.Router();
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  addProposalDocument,
  getProposalStats,
} = require('../controllers/proposalController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');

router.route('/').post(protect, createProposal).get(protect, getProposals);
router.route('/stats').get(protect, getProposalStats);
router
  .route('/:id')
  .get(protect, getProposalById)
  .put(protect, updateProposal)
  .delete(protect, checkRole(['admin', 'manager']), deleteProposal);
router.route('/:id/documents').post(protect, addProposalDocument);

module.exports = router;