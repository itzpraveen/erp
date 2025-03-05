const Lead = require('../models/Lead');

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  console.log('POST /api/leads called with data:', req.body);
  
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
  } = req.body;

  const lead = await Lead.create({
    name,
    email,
    phone,
    address,
    source,
    propertyType,
    notes,
    energyBill,
    roofDetails,
    status: 'new',
  });

  if (lead) {
    // Return the created lead with a timestamp
    const populatedLead = await Lead.findById(lead._id);
    console.log('Lead created successfully:', populatedLead._id);
    res.status(201).json(populatedLead);
  } else {
    res.status(400);
    throw new Error('Invalid lead data');
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  console.log('GET /api/leads called with params:', req.query);
  
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

  // Add filter for sales role (only see leads assigned to them)
  if (req.user && req.user.role === 'sales') {
    filter.assignedTo = req.user._id;
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalLeads = await Lead.countDocuments(filter);

  console.log(`Found ${leads.length} leads, total: ${totalLeads}`);

  res.json({
    leads,
    page,
    pages: Math.ceil(totalLeads / limit),
    total: totalLeads,
  });
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate(
    'assignedTo',
    'name email'
  );

  if (lead) {
    // Check if user has access to this lead
    if (
      req.user && req.user.role === 'sales' &&
      lead.assignedTo &&
      lead.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to access this lead');
    }

    res.json(lead);
  } else {
    res.status(404);
    throw new Error('Lead not found');
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (lead) {
    // Check if user has access to update this lead
    if (
      req.user && req.user.role === 'sales' &&
      lead.assignedTo &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this lead');
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        lead[key] = req.body[key];
      }
    });

    const updatedLead = await lead.save();
    res.json(updatedLead);
  } else {
    res.status(404);
    throw new Error('Lead not found');
  }
};

// @desc    Delete lead (soft delete by changing status)
// @route   DELETE /api/leads/:id
// @access  Private/Admin
const deleteLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (lead) {
    lead.status = 'closed_lost';
    lead.notes = lead.notes
      ? `${lead.notes}\n\nLead marked as deleted on ${new Date().toISOString()}.`
      : `Lead marked as deleted on ${new Date().toISOString()}.`;

    await lead.save();
    res.json({ message: 'Lead marked as closed_lost' });
  } else {
    res.status(404);
    throw new Error('Lead not found');
  }
};

// @desc    Assign lead to user
// @route   PUT /api/leads/:id/assign
// @access  Private/Admin or Manager
const assignLead = async (req, res) => {
  const { userId } = req.body;

  const lead = await Lead.findById(req.params.id);

  if (lead) {
    lead.assignedTo = userId;
    lead.notes = lead.notes
      ? `${lead.notes}\n\nLead assigned on ${new Date().toISOString()}.`
      : `Lead assigned on ${new Date().toISOString()}.`;

    const updatedLead = await lead.save();
    res.json(updatedLead);
  } else {
    res.status(404);
    throw new Error('Lead not found');
  }
};

// @desc    Get lead stats
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res) => {
  // Filter for user role
  const filter = {};
  // Add null check before accessing req.user.role
  if (req.user && req.user.role === 'sales') {
    filter.assignedTo = req.user._id;
  }

  // Get counts by status
  const statusCounts = await Lead.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Get counts by source
  const sourceCounts = await Lead.aggregate([
    { $match: filter },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);

  // Get counts by propertyType
  const propertyTypeCounts = await Lead.aggregate([
    { $match: filter },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
  ]);

  // Get trend of new leads over time (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const leadsByMonth = await Lead.aggregate([
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
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    statusCounts,
    sourceCounts,
    propertyTypeCounts,
    leadsByMonth,
  });
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  getLeadStats,
};