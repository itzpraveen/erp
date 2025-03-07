const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const ServiceRequest = require('../models/ServiceRequest');

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  console.log('POST /api/customers called with data:', req.body);
  
  const {
    name,
    email,
    phone,
    alternatePhone,
    address,
    type,
    status,
    contactPerson,
    gstNumber,
    notes,
  } = req.body;

  // Check if customer with same email already exists
  const customerExists = await Customer.findOne({ email });
  if (customerExists) {
    res.status(400);
    throw new Error('Customer with this email already exists');
  }

  const customer = await Customer.create({
    name,
    email,
    phone,
    alternatePhone,
    address,
    type,
    status,
    contactPerson,
    gstNumber,
    notes,
    lifetimeValue: 0,
    totalProjects: 0,
  });

  if (customer) {
    console.log('Customer created successfully:', customer._id);
    res.status(201).json(customer);
  } else {
    res.status(400);
    throw new Error('Invalid customer data');
  }
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  console.log('GET /api/customers called with params:', req.query);
  
  // Create filter for query
  const filter = {};
  
  // Add filters from query params
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Add text search if provided
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Only select fields we need to display in the list view
  const projection = {
    name: 1,
    email: 1,
    phone: 1,
    type: 1,
    status: 1,
    lifetimeValue: 1,
    totalProjects: 1,
    createdAt: 1
  };

  // Run queries in parallel with Promise.all for better performance
  const [customers, totalCustomers] = await Promise.all([
    Customer.find(filter)
      .select(projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // Convert to plain JS object for faster serialization
      
    Customer.countDocuments(filter)
  ]);

  console.log(`Found ${customers.length} customers, total: ${totalCustomers}`);

  res.json({
    customers,
    page,
    pages: Math.ceil(totalCustomers / limit),
    total: totalCustomers,
  });
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && 
          key !== 'lifetimeValue' && key !== 'totalProjects') {
        customer[key] = req.body[key];
      }
    });

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
};

// @desc    Delete customer (mark as inactive)
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.status = 'inactive';
    await customer.save();
    res.json({ message: 'Customer marked as inactive' });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
};

// @desc    Get customer history (leads, proposals, projects, service requests)
// @route   GET /api/customers/:id/history
// @access  Private
const getCustomerHistory = async (req, res) => {
  const customerId = req.params.id;

  try {
    // Execute all queries in parallel for better performance
    const [leads, proposals, projects, serviceRequests] = await Promise.all([
      // Get customer leads with selective field projection
      Lead.find({ customer: customerId })
        .select('name email phone status source assignedTo createdAt updatedAt')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .lean(),

      // Get customer proposals with selective field projection
      Proposal.find({ customer: customerId })
        .select('name amount status createdAt updatedAt proposalDate expiryDate')
        .sort({ createdAt: -1 })
        .lean(),

      // Get customer projects with selective field projection
      Project.find({ customer: customerId })
        .select('name status startDate endDate budget actualCost progress')
        .sort({ createdAt: -1 })
        .lean(),

      // Get customer service requests with selective field projection
      ServiceRequest.find({ customer: customerId })
        .select('title description status priority project createdAt scheduledDate completedDate')
        .populate('project', 'name contractNumber')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    res.json({
      leads,
      proposals,
      projects,
      serviceRequests
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error retrieving customer history');
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
const getCustomerStats = async (req, res) => {
  try {
    // Run multiple aggregation pipelines in parallel for better performance
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [
      typeCounts,
      statusCounts,
      totalValue,
      customersByMonth,
      topCustomers
    ] = await Promise.all([
      // Get counts by type
      Customer.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),

      // Get counts by status
      Customer.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Get total lifetime value
      Customer.aggregate([
        { $group: { _id: null, total: { $sum: '$lifetimeValue' } } },
      ]),

      // Get new customers per month (last 6 months)
      Customer.aggregate([
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

      // Get top customers by value - only select necessary fields
      Customer.find()
        .select('name email type lifetimeValue totalProjects')
        .sort({ lifetimeValue: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      typeCounts,
      statusCounts,
      totalValue: totalValue.length > 0 ? totalValue[0].total : 0,
      customersByMonth,
      topCustomers,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Error retrieving customer statistics');
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerHistory,
  getCustomerStats,
};