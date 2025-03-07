const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

// @desc    Create a new project from an accepted proposal
// @route   POST /api/projects
// @access  Private/Admin or Manager
const createProject = async (req, res) => {
  try {
    const {
      proposal: proposalId,
      contractNumber,
      projectManager,
      estimatedInstallDate,
    } = req.body;

    console.log("Creating project from proposal ID:", proposalId);

    // Validate proposal exists and is accepted
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      console.error("Proposal not found with ID:", proposalId);
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    // Populate lead data
    await proposal.populate('lead');
    if (!proposal.lead) {
      console.error("Lead not found for proposal:", proposalId);
      return res.status(404).json({ message: 'Lead information is missing for this proposal' });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({ message: 'Cannot create project from unaccepted proposal' });
    }

    // Check if project already exists for this proposal
    const existingProject = await Project.findOne({ proposal: proposalId });
    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists for this proposal' });
    }

    // Convert lead to customer or get existing customer
    let customer;
    
    // First check if customer already exists with this email
    if (proposal.lead.email) {
      customer = await Customer.findOne({ email: proposal.lead.email });
      console.log(`Checking for existing customer with email ${proposal.lead.email}:`, customer ? 'Found' : 'Not found');
    }
    
    if (!customer) {
      // Create new customer from lead data
      const leadData = proposal.lead;
      
      // Format address if it exists
      let formattedAddress = 'Address not provided';
      if (leadData.address) {
        const parts = [];
        if (leadData.address.street) parts.push(leadData.address.street);
      if (leadData.address.city) parts.push(leadData.address.city);
      if (leadData.address.state) parts.push(leadData.address.state);
      if (leadData.address.zipCode) parts.push(leadData.address.zipCode);
      if (leadData.address.country) parts.push(leadData.address.country);
      
      if (parts.length > 0) {
        formattedAddress = parts.join(', ');
      }
    }
    
    try {
      console.log("Creating new customer from lead data:", {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone
      });
      
      customer = await Customer.create({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        address: formattedAddress,
        type: leadData.propertyType === 'residential' ? 'residential' : 'commercial',
        status: 'active',
        notes: `Converted from lead ID: ${leadData._id}\n\n${leadData.notes || ''}`,
      });
      
      // Update lead status to closed_won
      await Lead.findByIdAndUpdate(leadData._id, { status: 'closed_won' });
    } catch (err) {
      console.error("Error creating customer:", err.message);
      return res.status(500).json({ message: 'Failed to create customer from lead data', error: err.message });
    }
  }

  // Create project
  try {
    console.log("Creating project with customer ID:", customer._id);
    
    const project = await Project.create({
      proposal: proposalId,
      customer: customer._id, // Use customer ID instead of lead ID
      contractNumber,
      projectManager,
      timeline: {
        contractSigned: new Date(),
        installationStart: estimatedInstallDate,
      },
      status: 'planning',
    });

    if (project) {
      // Update customer's totalProjects count
      await Customer.findByIdAndUpdate(customer._id, { $inc: { totalProjects: 1 } });
      
      // Fully populate the project for response
      const populatedProject = await Project.findById(project._id)
        .populate('customer', 'name email phone')
        .populate('projectManager', 'name email')
        .populate('proposal', 'title systemDetails.totalCapacity');
        
      return res.status(201).json(populatedProject);
    } else {
      return res.status(400).json({ message: 'Invalid project data' });
    }
  } catch (err) {
    console.error("Error creating project:", err.message);
    return res.status(500).json({ message: 'Failed to create project', error: err.message });
  }
  } catch (error) {
    console.error("Project creation error:", error.message);
    return res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// @desc    Get all projects with filtering
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Create filter for query
    const filter = {};

    // Add filters from query params
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.customer) {
      filter.customer = req.query.customer;
    }

    if (req.query.projectManager) {
      filter.projectManager = req.query.projectManager;
    }

    // Technicians can only see projects they're assigned to
    if (req.user.role === 'technician') {
      filter.installationTeam = req.user._id;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const projects = await Project.find(filter)
        .populate('customer', 'name email phone type status contactPerson')
        .populate('projectManager', 'name email department')
        .populate('installationTeam', 'name email department')
        .populate('proposal', 'title systemDetails.totalCapacity systemDetails.panelType')
        .sort({ 'timeline.contractSigned': -1 })
        .skip(skip)
        .limit(limit);

      const totalProjects = await Project.countDocuments(filter);

      // Handle empty results or failures gracefully
      res.json({
        projects: projects || [],
        page,
        pages: Math.ceil(totalProjects / limit) || 1,
        total: totalProjects || 0,
      });
    } catch (err) {
      console.error('Error fetching projects:', err);
      // Return empty results instead of an error
      res.json({
        projects: [],
        page: 1,
        pages: 1,
        total: 0,
      });
    }
  } catch (error) {
    console.error('Project listing error:', error);
    // Return empty results rather than a 500 error
    res.json({
      projects: [],
      page: 1,
      pages: 1,
      total: 0,
    });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('customer', 'name email phone address')
    .populate('projectManager', 'name email')
    .populate('installationTeam', 'name email')
    .populate('proposal', 'title systemDetails financialDetails');

  if (project) {
    // Check if user has access to this project if they're a technician
    if (
      req.user.role === 'technician' &&
      !project.installationTeam.some(
        (tech) => tech._id.toString() === req.user._id.toString()
      )
    ) {
      res.status(401);
      throw new Error('Not authorized to access this project');
    }

    res.json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin or Manager
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    // Update fields
    const updatableFields = [
      'status',
      'timeline',
      'projectManager',
      'installationTeam',
      'equipmentUsed',
      'permitDetails',
      'inspectionDetails',
      'paymentSchedule',
      'notes',
      'documents',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Handle arrays that should be appended, not replaced
        if (
          field === 'notes' ||
          field === 'documents' ||
          field === 'inspectionDetails'
        ) {
          if (Array.isArray(req.body[field])) {
            req.body[field].forEach((item) => {
              if (field === 'notes') {
                item.createdBy = req.user._id;
              }
              project[field].push(item);
            });
          }
        } else {
          project[field] = req.body[field];
        }
      }
    });

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Assign installation team
// @route   PUT /api/projects/:id/assign-team
// @access  Private/Admin or Manager
const assignInstallationTeam = async (req, res) => {
  const { teamMembers } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.installationTeam = teamMembers;
    
    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private/Admin or Manager or ProjectManager
const updateProjectStatus = async (req, res) => {
  const { status, notes } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    // Check if user is the project manager
    if (
      req.user.role === 'project_manager' &&
      project.projectManager.toString() !== req.user._id.toString()
    ) {
      res.status(401);
      throw new Error('Not authorized to update this project');
    }

    project.status = status;
    
    // Add status change to notes
    project.notes.push({
      text: `Status changed to ${status}${notes ? `: ${notes}` : ''}`,
      createdBy: req.user._id,
    });

    // Update timeline based on status
    if (status === 'permitting') {
      project.timeline.permitSubmitted = new Date();
    } else if (status === 'scheduled') {
      // If not already set
      if (!project.timeline.permitApproved) {
        project.timeline.permitApproved = new Date();
      }
    } else if (status === 'in_progress') {
      project.timeline.installationStart = new Date();
    } else if (status === 'inspection') {
      project.timeline.installationEnd = new Date();
    } else if (status === 'completed') {
      project.timeline.completionDate = new Date();
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Add equipment to project
// @route   POST /api/projects/:id/equipment
// @access  Private
const addProjectEquipment = async (req, res) => {
  const { type, manufacturer, model, serialNumber, quantity } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.equipmentUsed.push({
      type,
      manufacturer, 
      model,
      serialNumber,
      quantity,
    });

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Add inspection details
// @route   POST /api/projects/:id/inspections
// @access  Private
const addInspectionDetails = async (req, res) => {
  const { inspectionType, inspectionDate, inspector, status, notes, documents } = req.body;

  const project = await Project.findById(req.params.id);

  if (project) {
    project.inspectionDetails.push({
      inspectionType,
      inspectionDate,
      inspector,
      status,
      notes,
      documents: documents || [],
    });

    // Update timeline if first inspection
    if (!project.timeline.inspectionDate) {
      project.timeline.inspectionDate = inspectionDate;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
};

// @desc    Get project stats
// @route   GET /api/projects/stats
// @access  Private/Admin or Manager
const getProjectStats = async (req, res) => {
  try {
    // Default values in case of errors
    let statusCounts = [];
    let avgTimelines = {};
    let upcomingInstallations = [];
    let projectsByMonth = [];

    try {
      // Get counts by status
      statusCounts = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
    } catch (err) {
      console.error('Error getting status counts:', err);
    }

    try {
      // Get average timeline durations
      const avgTimelinesResult = await Project.aggregate([
        {
          $match: {
            'timeline.contractSigned': { $exists: true },
            'timeline.completionDate': { $exists: true },
          },
        },
        {
          $project: {
            totalDuration: {
              $divide: [
                {
                  $subtract: [
                    '$timeline.completionDate',
                    '$timeline.contractSigned',
                  ],
                },
                // Convert milliseconds to days
                1000 * 60 * 60 * 24,
              ],
            },
            permitDuration: {
              $cond: {
                if: {
                  $and: [
                    { $exists: ['$timeline.permitSubmitted', true] },
                    { $exists: ['$timeline.permitApproved', true] },
                  ],
                },
                then: {
                  $divide: [
                    {
                      $subtract: [
                        '$timeline.permitApproved',
                        '$timeline.permitSubmitted',
                      ],
                    },
                    1000 * 60 * 60 * 24,
                  ],
                },
                else: null,
              },
            },
            installationDuration: {
              $cond: {
                if: {
                  $and: [
                    { $exists: ['$timeline.installationStart', true] },
                    { $exists: ['$timeline.installationEnd', true] },
                  ],
                },
                then: {
                  $divide: [
                    {
                      $subtract: [
                        '$timeline.installationEnd',
                        '$timeline.installationStart',
                      ],
                    },
                    1000 * 60 * 60 * 24,
                  ],
                },
                else: null,
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTotalDuration: { $avg: '$totalDuration' },
            avgPermitDuration: { $avg: '$permitDuration' },
            avgInstallationDuration: { $avg: '$installationDuration' },
          },
        },
      ]);

      avgTimelines = avgTimelinesResult.length > 0 ? avgTimelinesResult[0] : {};
    } catch (err) {
      console.error('Error getting average timelines:', err);
    }

    try {
      // Upcoming installations (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      upcomingInstallations = await Project.find({
        'timeline.installationStart': {
          $gte: today,
          $lte: thirtyDaysFromNow,
        },
      })
        .populate('customer', 'name')
        .populate('projectManager', 'name')
        .sort({ 'timeline.installationStart': 1 })
        .limit(10)
        .select(
          'contractNumber timeline.installationStart customer projectManager status'
        );
    } catch (err) {
      console.error('Error getting upcoming installations:', err);
    }

    try {
      // Projects by month (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      projectsByMonth = await Project.aggregate([
        {
          $match: {
            'timeline.contractSigned': { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$timeline.contractSigned' },
              month: { $month: '$timeline.contractSigned' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);
    } catch (err) {
      console.error('Error getting projects by month:', err);
    }

    res.json({
      statusCounts,
      avgTimelines,
      upcomingInstallations,
      projectsByMonth,
    });
  } catch (error) {
    console.error('Error getting project stats:', error);
    // Return empty data instead of an error
    res.json({
      statusCounts: [],
      avgTimelines: {},
      upcomingInstallations: [],
      projectsByMonth: [],
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  assignInstallationTeam,
  updateProjectStatus,
  addProjectEquipment,
  addInspectionDetails,
  getProjectStats,
};