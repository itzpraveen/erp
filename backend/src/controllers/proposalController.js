const Proposal = require('../models/Proposal');
const Lead = require('../models/Lead');
const { cacheUtils } = require('../config/cache/redis');

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private
const createProposal = async (req, res) => {
  console.log('POST /api/proposals called with data:', req.body);
  
  const {
    title,
    lead,
    customer,
    systemDetails,
    financialDetails,
    status,
    estimatedInstallDate,
    notes,
  } = req.body;

  try {
    // Verify the lead exists
    const leadExists = await Lead.findById(lead);
    if (!leadExists) {
      res.status(404);
      throw new Error('Lead not found');
    }
    
    // Create proposal
    const proposal = await Proposal.create({
      title,
      lead,
      customer,
      systemDetails,
      financialDetails,
      status: status || 'draft',
      estimatedInstallDate,
      notes,
      createdBy: req.user._id,
      version: 1,
      history: [
        {
          version: 1,
          status: status || 'draft',
          updatedBy: req.user._id,
          updatedAt: new Date(),
          notes: 'Initial proposal created',
        },
      ],
    });

    if (proposal) {
      // Clear cache for proposals
      await cacheUtils.clearPattern('__express__/api/proposals*');
      
      // Return the created proposal
      const populatedProposal = await Proposal.findById(proposal._id)
        .populate('lead', 'name email phone')
        .populate('customer', 'name email phone')
        .populate('createdBy', 'name email');
        
      console.log('Proposal created successfully:', populatedProposal._id);
      res.status(201).json(populatedProposal);
    } else {
      res.status(400);
      throw new Error('Invalid proposal data');
    }
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Server error while creating proposal'
    });
  }
};

// @desc    Get all proposals
// @route   GET /api/proposals
// @access  Private
const getProposals = async (req, res) => {
  console.log('GET /api/proposals called with params:', req.query);
  
  try {
    // Create filter for query
    const filter = {};
    
    // Add filters from query params
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.lead) {
      filter.lead = req.query.lead;
    }
    
    if (req.query.customer) {
      filter.customer = req.query.customer;
    }
    
    // Add search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    // Add date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Create aggregate pipeline
    const aggregatePipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'leads',
          localField: 'lead',
          foreignField: '_id',
          as: 'leadDetails',
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdByUser',
        },
      },
      { $unwind: { path: '$leadDetails', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$createdByUser', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          systemDetails: 1,
          financialDetails: 1,
          estimatedInstallDate: 1,
          createdAt: 1,
          updatedAt: 1,
          version: 1,
          lead: '$leadDetails._id',
          leadName: '$leadDetails.name',
          customer: '$customerDetails._id',
          customerName: '$customerDetails.name',
          createdBy: '$createdByUser._id',
          createdByName: '$createdByUser.name',
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Execute aggregate pipeline
    const proposals = await Proposal.aggregate(aggregatePipeline);

    // Get total count for pagination
    const totalProposals = await Proposal.countDocuments(filter);

    console.log(`Found ${proposals.length} proposals, total: ${totalProposals}`);
    
    // Calculate additional metrics
    const averageSystemSize = await Proposal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageSize: { $avg: '$systemDetails.totalCapacity' },
        },
      },
    ]);
    
    const averageCost = await Proposal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageCost: { $avg: '$financialDetails.totalCost' },
        },
      },
    ]);
    
    const statusCounts = await Proposal.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      proposals,
      page,
      pages: Math.ceil(totalProposals / limit),
      total: totalProposals,
      metrics: {
        averageSystemSize: averageSystemSize.length > 0 ? averageSystemSize[0].averageSize : 0,
        averageCost: averageCost.length > 0 ? averageCost[0].averageCost : 0,
        statusCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      message: 'Server error while fetching proposals'
    });
  }
};

// @desc    Get proposal by ID
// @route   GET /api/proposals/:id
// @access  Private
const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('lead', 'name email phone')
      .populate('customer', 'name email phone type address')
      .populate('createdBy', 'name email')
      .populate('history.updatedBy', 'name email');

    if (proposal) {
      res.json(proposal);
    } else {
      res.status(404);
      throw new Error('Proposal not found');
    }
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Server error while fetching proposal'
    });
  }
};

// @desc    Update proposal
// @route   PUT /api/proposals/:id
// @access  Private
const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (proposal) {
      const {
        title,
        lead,
        customer,
        systemDetails,
        financialDetails,
        status,
        estimatedInstallDate,
        notes,
      } = req.body;

      // Check if status is changing
      const statusChanged = status && status !== proposal.status;
      
      // Update fields
      proposal.title = title || proposal.title;
      proposal.lead = lead || proposal.lead;
      proposal.customer = customer || proposal.customer;
      
      if (systemDetails) {
        proposal.systemDetails = {
          ...proposal.systemDetails,
          ...systemDetails,
        };
      }
      
      if (financialDetails) {
        proposal.financialDetails = {
          ...proposal.financialDetails,
          ...financialDetails,
        };
      }
      
      proposal.status = status || proposal.status;
      proposal.estimatedInstallDate = estimatedInstallDate || proposal.estimatedInstallDate;
      proposal.notes = notes || proposal.notes;
      
      // If significant changes, increment version
      if (
        title || 
        systemDetails?.totalCapacity || 
        financialDetails?.totalCost || 
        statusChanged
      ) {
        proposal.version += 1;
        
        // Add to history
        proposal.history.push({
          version: proposal.version,
          status: proposal.status,
          updatedBy: req.user._id,
          updatedAt: new Date(),
          notes: req.body.historyNote || 'Proposal updated',
        });
      }

      const updatedProposal = await proposal.save();
      
      // Clear cache
      await cacheUtils.clearPattern('__express__/api/proposals*');
      await cacheUtils.clearPattern(`__express__/api/proposals/${updatedProposal._id}`);
      
      // Return updated proposal
      const populatedProposal = await Proposal.findById(updatedProposal._id)
        .populate('lead', 'name email phone')
        .populate('customer', 'name email phone')
        .populate('createdBy', 'name email')
        .populate('history.updatedBy', 'name email');
        
      res.json(populatedProposal);
    } else {
      res.status(404);
      throw new Error('Proposal not found');
    }
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Server error while updating proposal'
    });
  }
};

// @desc    Delete proposal (soft delete by changing status)
// @route   DELETE /api/proposals/:id
// @access  Private/Admin
const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (proposal) {
      // Soft delete by changing status to rejected
      proposal.status = 'rejected';
      proposal.notes = proposal.notes
        ? `${proposal.notes}\n\nProposal marked as deleted on ${new Date().toISOString()}.`
        : `Proposal marked as deleted on ${new Date().toISOString()}.`;
        
      // Add to history
      proposal.history.push({
        version: proposal.version + 1,
        status: 'rejected',
        updatedBy: req.user._id,
        updatedAt: new Date(),
        notes: 'Proposal deleted',
      });

      await proposal.save();
      
      // Clear cache
      await cacheUtils.clearPattern('__express__/api/proposals*');
      
      res.json({ message: 'Proposal marked as rejected' });
    } else {
      res.status(404);
      throw new Error('Proposal not found');
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Server error while deleting proposal'
    });
  }
};

// @desc    Get proposal stats
// @route   GET /api/proposals/stats
// @access  Private
const getProposalStats = async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Proposal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get trend of new proposals over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const proposalsByMonth = await Proposal.aggregate([
      {
        $match: {
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
          averageSystemSize: { $avg: '$systemDetails.totalCapacity' },
          averageCost: { $avg: '$financialDetails.totalCost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    
    // Get conversion rates
    const conversionRate = await Proposal.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] 
            } 
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          accepted: 1,
          conversionRate: { 
            $multiply: [
              { $divide: ['$accepted', '$total'] },
              100
            ]
          }
        }
      }
    ]);
    
    // Get system size distribution
    const systemSizeDistribution = await Proposal.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$systemDetails.totalCapacity', 5] }, then: '0-5 kW' },
                { case: { $lte: ['$systemDetails.totalCapacity', 10] }, then: '5-10 kW' },
                { case: { $lte: ['$systemDetails.totalCapacity', 20] }, then: '10-20 kW' },
                { case: { $lte: ['$systemDetails.totalCapacity', 50] }, then: '20-50 kW' },
              ],
              default: '50+ kW'
            }
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      statusCounts,
      proposalsByMonth,
      conversionRate: conversionRate.length > 0 ? conversionRate[0] : { total: 0, accepted: 0, conversionRate: 0 },
      systemSizeDistribution,
    });
  } catch (error) {
    console.error('Error fetching proposal stats:', error);
    res.status(500).json({
      message: 'Server error while fetching proposal stats'
    });
  }
};

module.exports = {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  getProposalStats,
};