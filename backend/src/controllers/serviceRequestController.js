const ServiceRequest = require('../models/ServiceRequest');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private
const createServiceRequest = async (req, res) => {
  try {
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

    // Check if project exists if provided
    if (project) {
      try {
        // Check if it's a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(project)) {
          const projectExists = await Project.findById(project).select('_id');
          if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
          }
        } else {
          // Invalid project ID
          return res.status(400).json({ message: 'Invalid project ID format' });
        }
      } catch (error) {
        return res.status(400).json({ message: `Error validating project: ${error.message}` });
      }
    }

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      project: project || null, // Ensure empty strings are converted to null
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
      return res.status(201).json(serviceRequest);
    } else {
      return res.status(400).json({ message: 'Invalid service request data' });
    }
  } catch (error) {
    console.error('Error in createServiceRequest:', error);
    return res.status(500).json({ 
      message: 'Server error creating service request',
      error: error.message
    });
  }
};

// @desc    Get all service requests with filtering
// @route   GET /api/service-requests
// @access  Private
const getServiceRequests = async (req, res) => {
  try {
    // Create filter for query
    const filter = {};

    // Add filters from query params
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.project && mongoose.Types.ObjectId.isValid(req.query.project)) {
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

    // Use lean() for better performance and select only needed fields
    const serviceRequests = await ServiceRequest.find(filter)
      .select('title description requestType priority status scheduledDate customer project assignedTo createdAt')
      .populate('project', 'contractNumber name')
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Use countDocuments with timeout for large collections
    const countPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(0);
        console.warn('Count operation timed out, returning approximate count');
      }, 5000);

      ServiceRequest.countDocuments(filter)
        .then(count => {
          clearTimeout(timeout);
          resolve(count);
        })
        .catch(err => {
          clearTimeout(timeout);
          console.error('Error counting documents:', err);
          resolve(0);
        });
    });

    const totalServiceRequests = await countPromise;

    return res.json({
      serviceRequests,
      page,
      pages: Math.ceil(totalServiceRequests / limit) || 1,
      total: totalServiceRequests || 0,
    });
  } catch (error) {
    console.error('Error in getServiceRequests:', error);
    return res.status(500).json({
      message: 'Error fetching service requests',
      error: error.message,
      serviceRequests: [],
      page: 1,
      pages: 1,
      total: 0
    });
  }
};

// @desc    Get service request by ID
// @route   GET /api/service-requests/:id
// @access  Private
const getServiceRequestById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('project', 'contractNumber name type capacity status')
      .populate('customer', 'name email phone address type contactPerson')
      .populate('assignedTo', 'name email department');

    if (serviceRequest) {
      // Check if user has access to this service request if they're a technician
      if (
        req.user.role === 'technician' &&
        serviceRequest.assignedTo &&
        serviceRequest.assignedTo._id.toString() !== req.user._id.toString()
      ) {
        return res.status(401).json({ message: 'Not authorized to access this service request' });
      }

      return res.json(serviceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in getServiceRequestById:', error);
    return res.status(500).json({
      message: 'Error fetching service request',
      error: error.message
    });
  }
};

// @desc    Update service request
// @route   PUT /api/service-requests/:id
// @access  Private
const updateServiceRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
      // Check if user has access to update this service request if they're a technician
      if (
        req.user.role === 'technician' &&
        serviceRequest.assignedTo &&
        serviceRequest.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res.status(401).json({ message: 'Not authorized to update this service request' });
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
        'warrantyRelated',
        'resolution',
      ];

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          serviceRequest[field] = req.body[field];
        }
      });

      // Handle cost object separately
      if (req.body.cost) {
        if (!serviceRequest.cost) {
          serviceRequest.cost = {};
        }
        
        if (req.body.cost.laborCost !== undefined) {
          serviceRequest.cost.laborCost = req.body.cost.laborCost;
        }
        
        if (req.body.cost.partsCost !== undefined) {
          serviceRequest.cost.partsCost = req.body.cost.partsCost;
        }
        
        // Calculate total cost
        if (serviceRequest.cost.laborCost && serviceRequest.cost.partsCost) {
          serviceRequest.cost.totalCost = serviceRequest.cost.laborCost + serviceRequest.cost.partsCost;
        }
        
        if (req.body.cost.invoiced !== undefined) {
          serviceRequest.cost.invoiced = req.body.cost.invoiced;
        }
        
        if (req.body.cost.invoiceNumber !== undefined) {
          serviceRequest.cost.invoiceNumber = req.body.cost.invoiceNumber;
        }
        
        if (req.body.cost.invoiceDate !== undefined) {
          serviceRequest.cost.invoiceDate = req.body.cost.invoiceDate;
        }
        
        if (req.body.cost.paymentStatus !== undefined) {
          serviceRequest.cost.paymentStatus = req.body.cost.paymentStatus;
        }
      }

      // Handle arrays that should be appended
      if (req.body.notes && Array.isArray(req.body.notes)) {
        req.body.notes.forEach((note) => {
          serviceRequest.notes.push({
            text: note.text,
            createdBy: req.user._id,
            createdAt: new Date()
          });
        });
      }

      if (req.body.images && Array.isArray(req.body.images)) {
        req.body.images.forEach((image) => {
          serviceRequest.images.push({
            ...image,
            uploadDate: new Date()
          });
        });
      }

      // Handle parts used
      if (req.body.partsUsed && Array.isArray(req.body.partsUsed)) {
        req.body.partsUsed.forEach((part) => {
          serviceRequest.partsUsed.push(part);
        });
        
        // Recalculate parts cost
        let totalPartsCost = 0;
        serviceRequest.partsUsed.forEach((part) => {
          totalPartsCost += (part.cost || 0) * (part.quantity || 0);
        });
        
        if (!serviceRequest.cost) {
          serviceRequest.cost = {};
        }
        
        serviceRequest.cost.partsCost = totalPartsCost;
        
        // Update total cost
        if (serviceRequest.cost.laborCost) {
          serviceRequest.cost.totalCost = serviceRequest.cost.laborCost + totalPartsCost;
        }
      }

      const updatedServiceRequest = await serviceRequest.save();
      return res.json(updatedServiceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in updateServiceRequest:', error);
    return res.status(500).json({
      message: 'Error updating service request',
      error: error.message
    });
  }
};

// @desc    Assign service request to technician
// @route   PUT /api/service-requests/:id/assign
// @access  Private/Admin or Manager
const assignServiceRequest = async (req, res) => {
  try {
    const { technicianId, scheduledDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
      serviceRequest.assignedTo = technicianId;
      serviceRequest.scheduledDate = scheduledDate || serviceRequest.scheduledDate;
      serviceRequest.status = 'assigned';

      serviceRequest.notes.push({
        text: `Service request assigned on ${new Date().toISOString()}.`,
        createdBy: req.user._id,
        createdAt: new Date()
      });

      const updatedServiceRequest = await serviceRequest.save();
      return res.json(updatedServiceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in assignServiceRequest:', error);
    return res.status(500).json({
      message: 'Error assigning service request',
      error: error.message
    });
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id/status
// @access  Private
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
      // Check if user has access to update this service request if they're a technician
      if (
        req.user.role === 'technician' &&
        serviceRequest.assignedTo &&
        serviceRequest.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res.status(401).json({ message: 'Not authorized to update this service request status' });
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
        createdAt: new Date()
      });

      const updatedServiceRequest = await serviceRequest.save();
      return res.json(updatedServiceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in updateServiceRequestStatus:', error);
    return res.status(500).json({
      message: 'Error updating service request status',
      error: error.message
    });
  }
};

// @desc    Add parts used to service request
// @route   POST /api/service-requests/:id/parts
// @access  Private
const addServiceRequestParts = async (req, res) => {
  try {
    const { parts } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
      // Check if user has access
      if (
        req.user.role === 'technician' &&
        serviceRequest.assignedTo &&
        serviceRequest.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res.status(401).json({ message: 'Not authorized to update this service request' });
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
        totalPartsCost += (part.cost || 0) * (part.quantity || 0);
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
      return res.json(updatedServiceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in addServiceRequestParts:', error);
    return res.status(500).json({
      message: 'Error adding parts to service request',
      error: error.message
    });
  }
};

// @desc    Add customer feedback to service request
// @route   POST /api/service-requests/:id/feedback
// @access  Private
const addCustomerFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid service request ID format' });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (serviceRequest) {
      serviceRequest.customerFeedback = {
        rating,
        comments,
        date: new Date(),
      };

      const updatedServiceRequest = await serviceRequest.save();
      return res.json(updatedServiceRequest);
    } else {
      return res.status(404).json({ message: 'Service request not found' });
    }
  } catch (error) {
    console.error('Error in addCustomerFeedback:', error);
    return res.status(500).json({
      message: 'Error adding customer feedback',
      error: error.message
    });
  }
};

// @desc    Get service request stats
// @route   GET /api/service-requests/stats
// @access  Private/Admin or Manager
const getServiceRequestStats = async (req, res) => {
  try {
    // Initialize with default values
    let result = {
      statusCounts: [],
      requestTypeCounts: [],
      priorityCounts: [],
      avgResolutionTime: 0,
      avgRating: 0,
      requestsByMonth: []
    };

    // Use Promise.allSettled to run all queries in parallel and handle failures
    const [statusCounts, requestTypeCounts, priorityCounts, avgResolutionTime, avgRating, requestsByMonth] = 
      await Promise.allSettled([
        // Stats for requests by status
        ServiceRequest.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]).exec(),
        
        // Stats for requests by type
        ServiceRequest.aggregate([
          { $group: { _id: '$requestType', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]).exec(),
        
        // Stats for requests by priority
        ServiceRequest.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]).exec(),
        
        // Get average resolution time (for completed requests)
        ServiceRequest.aggregate([
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
        ]).exec(),
        
        // Get average customer rating
        ServiceRequest.aggregate([
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
        ]).exec(),
        
        // Requests by month (last 6 months)
        (async () => {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          return ServiceRequest.aggregate([
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
          ]).exec();
        })()
      ]);

    // Process results, handling any failed queries
    if (statusCounts.status === 'fulfilled') {
      result.statusCounts = statusCounts.value;
    }
    
    if (requestTypeCounts.status === 'fulfilled') {
      result.requestTypeCounts = requestTypeCounts.value;
    }
    
    if (priorityCounts.status === 'fulfilled') {
      result.priorityCounts = priorityCounts.value;
    }
    
    if (avgResolutionTime.status === 'fulfilled' && avgResolutionTime.value.length > 0) {
      result.avgResolutionTime = avgResolutionTime.value[0].avgTime;
    }
    
    if (avgRating.status === 'fulfilled' && avgRating.value.length > 0) {
      result.avgRating = avgRating.value[0].avgRating;
    }
    
    if (requestsByMonth.status === 'fulfilled') {
      result.requestsByMonth = requestsByMonth.value;
    }

    return res.json(result);
  } catch (error) {
    console.error('Error in getServiceRequestStats:', error);
    return res.status(500).json({
      message: 'Error getting service request statistics',
      error: error.message,
      // Return empty data
      statusCounts: [],
      requestTypeCounts: [],
      priorityCounts: [],
      avgResolutionTime: 0,
      avgRating: 0,
      requestsByMonth: []
    });
  }
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
