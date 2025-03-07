const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    source,
    propertyType,
    notes,
    energyBill,
    roofDetails,
    followUpDate,
  } = req.body;

  try {
    const leadExists = await Lead.findOne({ email });
    if (leadExists) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      address,
      source,
      propertyType,
      status: 'new',
      notes,
      energyBill,
      roofDetails,
      assignedTo: req.body.assignedTo || req.user._id,
      followUpDate,
    });

    if (lead) {
      res.status(201).json(lead);
    } else {
      return res.status(400).json({ message: 'Invalid lead data' });
    }
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: `Error creating lead: ${error.message}` });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    // Create filter for query
    const filter = {};
    
    // Add filters from query params
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.source) {
      filter.source = req.query.source;
    }
    
    if (req.query.propertyType) {
      filter.propertyType = req.query.propertyType;
    }
    
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    
    // For sales reps, only show leads assigned to them
    if (req.user.role === 'sales') {
      filter.assignedTo = req.user._id;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      // Select only the fields needed for list view
      const projection = {
        name: 1,
        email: 1,
        phone: 1,
        status: 1,
        source: 1,
        propertyType: 1,
        assignedTo: 1,
        createdAt: 1,
        followUpDate: 1
      };
      
      // Run queries in parallel for better performance
      const [leads, totalLeads] = await Promise.all([
        Lead.find(filter)
          .select(projection)
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(), // Convert to plain JS objects for faster serialization

        Lead.countDocuments(filter)
      ]);

      res.json({
        leads: leads || [],
        page,
        pages: Math.ceil(totalLeads / limit) || 1,
        total: totalLeads || 0,
      });
    } catch (err) {
      console.error('Error fetching leads:', err);
      // Return empty results instead of an error
      res.json({
        leads: [],
        page: 1,
        pages: 1,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Error in getLeads:', error);
    // Return empty data rather than an error
    res.json({
      leads: [],
      page: 1,
      pages: 1,
      total: 0
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res) => {
  try {
    // Default values in case of errors
    let statusStats = [];
    let sourceStats = [];
    let propertyTypeStats = [];
    let leadsByMonth = [];
    let salesPerformance = [];
    let totalLeads = 0;
    let closedWonLeads = 0;
    let conversionRate = 0;
    
    // Get data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Run multiple aggregations in parallel for better performance
    try {
      const [
        statusStatsResult,
        sourceStatsResult,
        propertyTypeStatsResult,
        leadsByMonthResult,
        countData,
        salesPerformanceResult
      ] = await Promise.all([
        // Stats for leads by status
        Lead.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        
        // Stats for leads by source
        Lead.aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        
        // Stats for leads by property type
        Lead.aggregate([
          { $group: { _id: '$propertyType', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),
        
        // Get new leads per month (last 6 months)
        Lead.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        
        // Get counts for conversion rate in a single query
        Lead.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              closedWon: {
                $sum: { $cond: [{ $eq: ['$status', 'closed_won'] }, 1, 0] }
              }
            }
          }
        ]),
        
        // Get sales rep performance
        Lead.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'assignedTo',
              foreignField: '_id',
              as: 'assignedToUser'
            }
          },
          { $unwind: { path: '$assignedToUser', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { 
                userId: '$assignedTo', 
                name: { $ifNull: ['$assignedToUser.name', 'Unassigned'] } 
              },
              totalLeads: { $sum: 1 },
              qualifiedLeads: {
                $sum: { $cond: [{ $in: ['$status', ['qualified', 'proposal', 'closed_won']] }, 1, 0] }
              },
              closedWon: { $sum: { $cond: [{ $eq: ['$status', 'closed_won'] }, 1, 0] } }
            }
          },
          {
            $project: {
              _id: 0,
              userId: '$_id.userId',
              name: '$_id.name',
              totalLeads: 1,
              qualifiedLeads: 1,
              closedWon: 1,
              qualificationRate: {
                $cond: [
                  { $eq: ['$totalLeads', 0] },
                  0,
                  { $multiply: [{ $divide: ['$qualifiedLeads', '$totalLeads'] }, 100] }
                ]
              },
              closingRate: {
                $cond: [
                  { $eq: ['$qualifiedLeads', 0] },
                  0,
                  { $multiply: [{ $divide: ['$closedWon', '$qualifiedLeads'] }, 100] }
                ]
              }
            }
          },
          { $sort: { closedWon: -1 } }
        ])
      ]);
      
      // Assign results
      statusStats = statusStatsResult;
      sourceStats = sourceStatsResult;
      propertyTypeStats = propertyTypeStatsResult;
      leadsByMonth = leadsByMonthResult;
      
      // Set count data if available
      if (countData && countData.length > 0) {
        totalLeads = countData[0].total;
        closedWonLeads = countData[0].closedWon;
        conversionRate = totalLeads > 0 ? (closedWonLeads / totalLeads) * 100 : 0;
      }
      
      salesPerformance = salesPerformanceResult;
      
    } catch (err) {
      console.error('Error getting lead statistics:', err);
    }

    res.json({
      statusCounts: statusStats || [],
      sourceCounts: sourceStats || [],
      propertyTypeStats: propertyTypeStats || [],
      leadsByMonth: leadsByMonth || [],
      conversionRate,
      salesPerformance: salesPerformance || [],
      totalLeads,
      closedWonLeads
    });
  } catch (error) {
    console.error('Error in getLeadStats:', error);
    // Return empty data rather than an error
    res.json({
      statusCounts: [],
      sourceCounts: [],
      propertyTypeStats: [],
      leadsByMonth: [],
      conversionRate: 0,
      salesPerformance: [],
      totalLeads: 0,
      closedWonLeads: 0
    });
  }
};


// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .lean(); // Use lean() for better performance

    if (lead) {
      // Check if user has access to this lead
      if (req.user.role === 'sales' && lead.assignedTo && lead.assignedTo._id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to access this lead');
      }

      res.json(lead);
    } else {
      res.status(404);
      throw new Error('Lead not found');
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Error fetching lead: ${error.message}`);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      // Check if user has access to update this lead
      if (req.user.role === 'sales' && lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this lead');
      }

      // Update fields
      lead.name = req.body.name || lead.name;
      lead.email = req.body.email || lead.email;
      lead.phone = req.body.phone || lead.phone;
      
      // Handle nested objects with care
      if (req.body.address) {
        lead.address = {
          ...lead.address,
          ...req.body.address
        };
      }
      
      lead.source = req.body.source || lead.source;
      lead.propertyType = req.body.propertyType || lead.propertyType;
      lead.status = req.body.status || lead.status;
      lead.notes = req.body.notes || lead.notes;
      
      if (req.body.energyBill) {
        lead.energyBill = {
          ...lead.energyBill,
          ...req.body.energyBill
        };
      }
      
      if (req.body.roofDetails) {
        lead.roofDetails = {
          ...lead.roofDetails,
          ...req.body.roofDetails
        };
      }
      
      // Only admin or manager can reassign leads
      if (req.body.assignedTo && ['admin', 'manager'].includes(req.user.role)) {
        lead.assignedTo = req.body.assignedTo;
      }
      
      lead.followUpDate = req.body.followUpDate || lead.followUpDate;

      const updatedLead = await lead.save();
      res.json(updatedLead);
    } else {
      res.status(404);
      throw new Error('Lead not found');
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Error updating lead: ${error.message}`);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      await lead.remove();
      res.json({ message: 'Lead removed' });
    } else {
      res.status(404);
      throw new Error('Lead not found');
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Error deleting lead: ${error.message}`);
  }
};

// @desc    Get all leads for customer selection (no pagination, minimal data)
// @route   GET /api/leads/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    // Only fetch active leads with status not 'lost'
    const customers = await Lead.find({ status: { $ne: 'lost' } })
      .select('name email phone propertyType')
      .sort({ name: 1 })
      .lean();
    
    res.json(customers);
  } catch (error) {
    res.status(500);
    throw new Error(`Error fetching customers: ${error.message}`);
  }
};

module.exports = {
  createLead,
  getLeads,
  getLeadStats,
  getLeadById,
  updateLead,
  deleteLead,
  getCustomers
};
