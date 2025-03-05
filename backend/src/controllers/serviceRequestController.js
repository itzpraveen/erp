const ServiceRequest = require('../models/ServiceRequest');
const Project = require('../models/Project');

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private
const createServiceRequest = async (req, res) => {
  const {
    project,
    customer,
    requestType,
    title,
    description,
    priority,
    scheduledDate,
    estimatedHours,
    warrantyRelated,
  } = req.body;

  // Check if project exists
  const projectExists = await Project.findById(project);
  if (!projectExists) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Create service request
  const serviceRequest = await ServiceRequest.create({
    project,
    customer,
    requestType,
    title,
    description,
    priority,
    scheduledDate,
    estimatedHours,
    status: 'new',
    warrantyRelated: warrantyRelated || false,
  });

  if (serviceRequest) {
    res.status(201).json(serviceRequest);
  } else {
    res.status(400);
    throw new Error('Invalid service request data');
  }
};

// @desc    Get all service requests with filtering
// @route   GET /api/service-requests
// @access  Private
const getServiceRequests = async (req, res) => {
  // Create filter for query
  const filter = {};

  // Add filters from query params
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.project) {
    filter.project = req.query.project;
  }

  if (req.query.customer) {
    filter.customer = req.query.customer;
  }

  if (req.query.requestType) {
    filter.requestType = req.query.requestType;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  if (req.query.assignedTo) {
    filter.assignedTo = req.query.assignedTo;
  }

  if (req.query.warrantyRelated) {
    filter.warrantyRelated = req.query.warrantyRelated === 'true';
  }

  // Technicians can only see service requests assigned to them
  if (req.user.role === 'technician') {
    filter.assignedTo = req.user._id;
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const serviceRequests = await ServiceRequest.find(filter)
    .populate('project', 'contractNumber')
    .populate('customer', 'name email phone')
    .populate('assignedTo', 'name email')
    .sort({ priority: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalServiceRequests = await ServiceRequest.countDocuments(filter);

  res.json({
    serviceRequests,
    page,
    pages: Math.ceil(totalServiceRequests / limit),
    total: totalServiceRequests,
  });
};

// @desc    Get service request by ID
// @route   GET /api/service-requests/:id
// @access  Private
const getServiceRequestById = async (req, res) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id)
    .populate('project', 'contractNumber')
    .populate('customer', 'name email phone address')
    .populate('assignedTo', 'name email');

  if (serviceRequest) {
    // Check if user has access to this service request if they're a technician
    if (
      req.user.role === 'technician' &&
      serviceRequest.assignedTo &&
      serviceRequest.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to access this service request');
    }

    res.json(serviceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Update service request
// @route   PUT /api/service-requests/:id
// @access  Private
const updateServiceRequest = async (req, res) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (serviceRequest) {
    // Check if user has access to update this service request if they're a technician
    if (
      req.user.role === 'technician' &&
      serviceRequest.assignedTo &&
      serviceRequest.assignedTo.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this service request');
    }

    // Update fields
    const updatableFields = [
      'requestType',
      'title',
      'description',
      'priority',
      'status',
      'scheduledDate',
      'completionDate',
      'estimatedHours',
      'actualHours',
      'partsUsed',
      'warrantyRelated',
      'resolution',
      'cost',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        serviceRequest[field] = req.body[field];
      }
    });

    // Handle arrays that should be appended
    if (req.body.notes) {
      if (Array.isArray(req.body.notes)) {
        req.body.notes.forEach((note) => {
          serviceRequest.notes.push({
            text: note.text,
            createdBy: req.user._id,
          });
        });
      }
    }

    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        req.body.images.forEach((image) => {
          serviceRequest.images.push(image);
        });
      }
    }

    const updatedServiceRequest = await serviceRequest.save();
    res.json(updatedServiceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Assign service request to technician
// @route   PUT /api/service-requests/:id/assign
// @access  Private/Admin or Manager
const assignServiceRequest = async (req, res) => {
  const { technicianId, scheduledDate } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (serviceRequest) {
    serviceRequest.assignedTo = technicianId;
    serviceRequest.scheduledDate = scheduledDate || serviceRequest.scheduledDate;
    serviceRequest.status = 'assigned';

    serviceRequest.notes.push({
      text: `Service request assigned on ${new Date().toISOString()}.`,
      createdBy: req.user._id,
    });

    const updatedServiceRequest = await serviceRequest.save();
    res.json(updatedServiceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id/status
// @access  Private
const updateServiceRequestStatus = async (req, res) => {
  const { status, notes } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (serviceRequest) {
    // Check if user has access to update this service request if they're a technician
    if (
      req.user.role === 'technician' &&
      serviceRequest.assignedTo &&
      serviceRequest.assignedTo.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this service request status');
    }

    serviceRequest.status = status;

    // Update dates based on status
    if (status === 'in_progress') {
      // If not already set, set started timestamp
    } else if (status === 'completed') {
      serviceRequest.completionDate = new Date();
    }

    // Add note
    serviceRequest.notes.push({
      text: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
      createdBy: req.user._id,
    });

    const updatedServiceRequest = await serviceRequest.save();
    res.json(updatedServiceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Add parts used to service request
// @route   POST /api/service-requests/:id/parts
// @access  Private
const addServiceRequestParts = async (req, res) => {
  const { parts } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (serviceRequest) {
    // Check if user has access
    if (
      req.user.role === 'technician' &&
      serviceRequest.assignedTo &&
      serviceRequest.assignedTo.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this service request');
    }

    // Add parts
    if (Array.isArray(parts)) {
      parts.forEach((part) => {
        serviceRequest.partsUsed.push(part);
      });
    }

    // Calculate total parts cost
    let totalPartsCost = 0;
    serviceRequest.partsUsed.forEach((part) => {
      totalPartsCost += part.cost * part.quantity;
    });

    // Update cost object
    if (!serviceRequest.cost) {
      serviceRequest.cost = {};
    }
    serviceRequest.cost.partsCost = totalPartsCost;

    // Calculate total cost if labor cost exists
    if (serviceRequest.cost.laborCost) {
      serviceRequest.cost.totalCost =
        serviceRequest.cost.partsCost + serviceRequest.cost.laborCost;
    }

    const updatedServiceRequest = await serviceRequest.save();
    res.json(updatedServiceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Add customer feedback to service request
// @route   POST /api/service-requests/:id/feedback
// @access  Private
const addCustomerFeedback = async (req, res) => {
  const { rating, comments } = req.body;

  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (serviceRequest) {
    serviceRequest.customerFeedback = {
      rating,
      comments,
      date: new Date(),
    };

    const updatedServiceRequest = await serviceRequest.save();
    res.json(updatedServiceRequest);
  } else {
    res.status(404);
    throw new Error('Service request not found');
  }
};

// @desc    Get service request stats
// @route   GET /api/service-requests/stats
// @access  Private/Admin or Manager
const getServiceRequestStats = async (req, res) => {
  // Get counts by status
  const statusCounts = await ServiceRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Get counts by request type
  const requestTypeCounts = await ServiceRequest.aggregate([
    { $group: { _id: '$requestType', count: { $sum: 1 } } },
  ]);

  // Get counts by priority
  const priorityCounts = await ServiceRequest.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Get average resolution time (for completed requests)
  const avgResolutionTime = await ServiceRequest.aggregate([
    {
      $match: {
        status: 'completed',
        completionDate: { $exists: true },
      },
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$completionDate', '$createdAt'] },
            // Convert milliseconds to hours
            1000 * 60 * 60,
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$resolutionTime' },
      },
    },
  ]);

  // Get average customer rating
  const avgRating = await ServiceRequest.aggregate([
    {
      $match: {
        'customerFeedback.rating': { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$customerFeedback.rating' },
      },
    },
  ]);

  // Requests by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const requestsByMonth = await ServiceRequest.aggregate([
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
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    statusCounts,
    requestTypeCounts,
    priorityCounts,
    avgResolutionTime: avgResolutionTime.length > 0 ? avgResolutionTime[0].avgTime : 0,
    avgRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
    requestsByMonth,
  });
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  assignServiceRequest,
  updateServiceRequestStatus,
  addServiceRequestParts,
  addCustomerFeedback,
  getServiceRequestStats,
};