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

  const customers = await Customer.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCustomers = await Customer.countDocuments(filter);

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
    // Get customer leads
    const leads = await Lead.find({ customer: customerId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Get customer proposals
    const proposals = await Proposal.find({ customer: customerId })
      .sort({ createdAt: -1 });

    // Get customer projects
    const projects = await Project.find({ customer: customerId })
      .sort({ createdAt: -1 });

    // Get customer service requests
    const serviceRequests = await ServiceRequest.find({ customer: customerId })
      .populate('project', 'name contractNumber')
      .sort({ createdAt: -1 });

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
    // Get counts by type
    const typeCounts = await Customer.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Get counts by status
    const statusCounts = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get total lifetime value
    const totalValue = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$lifetimeValue' } } },
    ]);

    // Get new customers per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const customersByMonth = await Customer.aggregate([
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
    ]);

    // Get top customers by value
    const topCustomers = await Customer.find()
      .sort({ lifetimeValue: -1 })
      .limit(5);

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