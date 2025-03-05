const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const Lead = require('../models/Lead');

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private
const createProposal = async (req, res) => {
  try {
    const {
      lead,
      title,
      systemDetails,
      financialDetails,
      estimatedInstallDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!lead) {
      res.status(400);
      throw new Error('Lead ID is required');
    }

    // Check if lead exists with better error handling
    try {
      // Validate leadId format first
      if (!mongoose.Types.ObjectId.isValid(lead)) {
        res.status(400);
        throw new Error('Invalid lead ID format');
      }
      
      const leadExists = await Lead.findById(lead);
      if (!leadExists) {
        res.status(404);
        throw new Error('Lead not found');
      }
    } catch (error) {
      console.error('Lead validation error:', error.message);
      if (error.message.includes('Invalid lead ID format')) {
        res.status(400);
        throw new Error('Invalid lead ID format');
      } else {
        res.status(404);
        throw new Error(`Lead not found: ${error.message}`);
      }
    }

    // Get lead again after validation (to use in status update)  
    const leadExists = await Lead.findById(lead);
    
    // Check if user is authenticated
    if (!req.user) {
      res.status(401);
      throw new Error('Authentication required. Please log in.');
    }

    // Create proposal
    const proposal = await Proposal.create({
      lead,
      title,
      systemDetails,
      financialDetails,
      estimatedInstallDate,
      notes,
      createdBy: req.user._id,
      status: 'draft',
    });

    if (proposal) {
      // Update lead status if it's not already in proposal or later stage
      if (
        leadExists.status !== 'proposal' &&
        leadExists.status !== 'closed_won' &&
        leadExists.status !== 'closed_lost'
      ) {
        leadExists.status = 'proposal';
        await leadExists.save();
      }

      // Return newly created proposal with populated lead info
      const populatedProposal = await Proposal.findById(proposal._id)
        .populate('lead', 'name email phone')
        .populate('createdBy', 'name email');

      res.status(201).json(populatedProposal);
    } else {
      res.status(400);
      throw new Error('Invalid proposal data');
    }
  } catch (error) {
    console.error('Proposal creation error:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw error;
  }
};

// @desc    Get all proposals with filtering
// @route   GET /api/proposals
// @access  Private
const getProposals = async (req, res) => {
  // Create filter for query
  const filter = {};

  // Add filters from query params
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.lead) {
    filter.lead = req.query.lead;
  }

  if (req.query.createdBy) {
    filter.createdBy = req.query.createdBy;
  }

  // Sales reps can only see their own proposals
  if (req.user && req.user.role === 'sales') {
    filter.createdBy = req.user._id;
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const proposals = await Proposal.find(filter)
    .populate('lead', 'name email phone')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalProposals = await Proposal.countDocuments(filter);

  res.json({
    proposals,
    page,
    pages: Math.ceil(totalProposals / limit),
    total: totalProposals,
  });
};

// @desc    Get proposal by ID
// @route   GET /api/proposals/:id
// @access  Private
const getProposalById = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id)
    .populate('lead', 'name email phone address status')
    .populate('createdBy', 'name email');

  if (proposal) {
    // Check if user has access to this proposal
    if (
      req.user && req.user.role === 'sales' &&
      proposal.createdBy._id.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to access this proposal');
    }

    res.json(proposal);
  } else {
    res.status(404);
    throw new Error('Proposal not found');
  }
};

// @desc    Update proposal
// @route   PUT /api/proposals/:id
// @access  Private
const updateProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);

  if (proposal) {
    // Check if user has access to update this proposal
    if (
      req.user && req.user.role === 'sales' &&
      proposal.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this proposal');
    }

    // Handle version increment if not a draft
    if (proposal.status !== 'draft' && req.body.status === 'draft') {
      // Create a new version if changing from sent/negotiating back to draft
      proposal.version += 1;
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (
        key !== '_id' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'createdBy' &&
        key !== 'lead'
      ) {
        proposal[key] = req.body[key];
      }
    });

    const updatedProposal = await proposal.save();

    // If proposal status changed to accepted, update lead status
    if (req.body.status === 'accepted') {
      const lead = await Lead.findById(proposal.lead);
      if (lead) {
        lead.status = 'closed_won';
        await lead.save();
      }
    }

    // If proposal status changed to rejected, check if it's the last proposal for this lead
    if (req.body.status === 'rejected') {
      const otherProposals = await Proposal.find({
        lead: proposal.lead,
        _id: { $ne: proposal._id },
        status: { $in: ['sent', 'negotiating', 'accepted'] },
      });

      // If no other active proposals, update lead status to closed_lost
      if (otherProposals.length === 0) {
        const lead = await Lead.findById(proposal.lead);
        if (lead) {
          lead.status = 'closed_lost';
          await lead.save();
        }
      }
    }

    res.json(updatedProposal);
  } else {
    res.status(404);
    throw new Error('Proposal not found');
  }
};

// @desc    Delete proposal (soft delete by marking as rejected)
// @route   DELETE /api/proposals/:id
// @access  Private/Admin
const deleteProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);

  if (proposal) {
    proposal.status = 'rejected';
    proposal.notes = proposal.notes
      ? `${proposal.notes}\n\nProposal marked as deleted on ${new Date().toISOString()}.`
      : `Proposal marked as deleted on ${new Date().toISOString()}.`;

    await proposal.save();
    res.json({ message: 'Proposal marked as rejected' });
  } else {
    res.status(404);
    throw new Error('Proposal not found');
  }
};

// @desc    Add document to proposal
// @route   POST /api/proposals/:id/documents
// @access  Private
const addProposalDocument = async (req, res) => {
  const { name, fileUrl, fileType } = req.body;

  const proposal = await Proposal.findById(req.params.id);

  if (proposal) {
    // Check if user has access to update this proposal
    if (
      req.user && req.user.role === 'sales' &&
      proposal.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this proposal');
    }

    proposal.documents.push({
      name,
      fileUrl,
      fileType,
    });

    const updatedProposal = await proposal.save();
    res.json(updatedProposal);
  } else {
    res.status(404);
    throw new Error('Proposal not found');
  }
};

// @desc    Get proposal stats
// @route   GET /api/proposals/stats
// @access  Private
const getProposalStats = async (req, res) => {
  // Filter for user role
  const filter = {};
  if (req.user && req.user.role === 'sales') {
    filter.createdBy = req.user._id;
  }

  // Get counts by status
  const statusCounts = await Proposal.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Get acceptance rate
  const totalProposals = await Proposal.countDocuments({
    ...filter,
    status: { $in: ['sent', 'negotiating', 'accepted', 'rejected'] },
  });

  const acceptedProposals = await Proposal.countDocuments({
    ...filter,
    status: 'accepted',
  });

  const acceptanceRate =
    totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

  // Get average system size
  const avgSystemSize = await Proposal.aggregate([
    {
      $match: {
        ...filter,
        'systemDetails.totalCapacity': { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgCapacity: { $avg: '$systemDetails.totalCapacity' },
      },
    },
  ]);

  // Get average contract value
  const avgContractValue = await Proposal.aggregate([
    {
      $match: {
        ...filter,
        'financialDetails.totalCost': { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avgCost: { $avg: '$financialDetails.totalCost' },
      },
    },
  ]);

  // Get trend of proposals over time (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const proposalsByMonth = await Proposal.aggregate([
    {
      $match: {
        ...filter,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        totalValue: { $sum: '$financialDetails.totalCost' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    statusCounts,
    acceptanceRate,
    avgSystemSize: avgSystemSize.length > 0 ? avgSystemSize[0].avgCapacity : 0,
    avgContractValue:
      avgContractValue.length > 0 ? avgContractValue[0].avgCost : 0,
    proposalsByMonth,
  });
};

module.exports = {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  addProposalDocument,
  getProposalStats,
};