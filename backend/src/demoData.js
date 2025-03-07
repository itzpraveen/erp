require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Lead = require('./models/Lead');
const Project = require('./models/Project');
const Proposal = require('./models/Proposal');
const ServiceRequest = require('./models/ServiceRequest');

const createDemoData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Get existing users for references
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    const salesUser = await User.findOne({ email: 'sales@example.com' });

    if (!adminUser || !salesUser) {
      console.error('Admin or Sales user not found. Please run loadDemoUsers.js first.');
      process.exit(1);
    }

    // Create a technician and project manager user
    const technicianUser = await User.create({
      name: 'Tech User',
      email: 'tech@example.com',
      password: 'password123',
      role: 'technician',
      department: 'service',
      active: true,
    });

    const projectManagerUser = await User.create({
      name: 'Project Manager',
      email: 'pm@example.com',
      password: 'password123',
      role: 'manager',
      department: 'operations',
      active: true,
    });

    console.log('Created technician and project manager users');

    // Create demo customers
    await Customer.deleteMany({});
    
    const customers = [
      {
        name: 'Suntech Industries',
        email: 'contact@suntech.com',
        phone: '9876543210',
        alternatePhone: '9876543211',
        address: {
          street: '123 Solar Park',
          city: 'Tech District',
          state: 'Bangalore',
          zipCode: '560001',
          country: 'India'
        },
        type: 'commercial',
        status: 'active',
        contactPerson: 'Rajesh Kumar',
        gstNumber: 'GSTIN29ABCDE1234F1Z5',
        notes: 'Large tech company with multiple buildings',
        lifetimeValue: 1500000,
        totalProjects: 2,
      },
      {
        name: 'Green Homes Society',
        email: 'secretary@greenhomes.org',
        phone: '8765432109',
        address: {
          street: '45 Eco Avenue',
          city: 'Green Layout',
          state: 'Mumbai',
          zipCode: '400001',
          country: 'India'
        },
        type: 'residential',
        status: 'active',
        contactPerson: 'Anita Sharma',
        gstNumber: 'GSTIN27FGHIJ5678K2Z6',
        notes: 'Residential society with 50 apartments',
        lifetimeValue: 750000,
        totalProjects: 1,
      },
      {
        name: 'Government School',
        email: 'principal@govtschool.edu.in',
        phone: '7654321098',
        address: {
          street: '78 Education Street',
          city: 'Central Area',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        type: 'government',
        status: 'active',
        contactPerson: 'Suresh Patel',
        gstNumber: 'NA',
        notes: 'Government funded school project',
        lifetimeValue: 500000,
        totalProjects: 1,
      },
      {
        name: 'Ashok Farms',
        email: 'ashok@farms.co.in',
        phone: '6543210987',
        address: {
          street: 'Rural Zone',
          city: 'Agricultural Belt',
          state: 'Chennai',
          zipCode: '600001',
          country: 'India'
        },
        type: 'industrial',
        status: 'active',
        contactPerson: 'Ashok Singh',
        gstNumber: 'GSTIN33KLMNO9012P3Z7',
        notes: 'Agricultural farm with irrigation needs',
        lifetimeValue: 350000,
        totalProjects: 1,
      },
      {
        name: 'Residential Customer',
        email: 'priya@gmail.com',
        phone: '9876543219',
        address: {
          street: '56 Home Street',
          city: 'Residential Area',
          state: 'Hyderabad',
          zipCode: '500001',
          country: 'India'
        },
        type: 'residential',
        status: 'active',
        contactPerson: 'Priya Reddy',
        notes: 'Small rooftop installation',
        lifetimeValue: 120000,
        totalProjects: 1,
      }
    ];
    
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`Created ${createdCustomers.length} demo customers`);

    // Create some leads for potential customers
    await Lead.deleteMany({});
    
    const leads = [
      {
        name: 'Tech Solutions Ltd',
        email: 'info@techsolutions.com',
        phone: '9988776655',
        address: {
          street: '789 Tech Park',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India',
        },
        source: 'website',
        propertyType: 'commercial',
        status: 'new',
        notes: 'Interested in a 50kW system for their office building',
        assignedTo: salesUser._id,
      },
      {
        name: 'Retirement Community',
        email: 'manager@retirement.org',
        phone: '8877665544',
        address: {
          street: '123 Senior Living',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
        },
        source: 'referral',
        propertyType: 'commercial',
        status: 'qualified',
        notes: 'Community of 30 homes looking for solar solution',
        assignedTo: salesUser._id,
      }
    ];
    
    const createdLeads = await Lead.insertMany(leads);
    console.log(`Created ${createdLeads.length} demo leads`);

    // Create proposals for the customers
    await Proposal.deleteMany({});
    
    const proposals = [
      {
        title: 'Commercial Solar Installation - Suntech',
        lead: createdLeads[0]._id, // Using first lead as a reference
        customer: createdCustomers[0]._id, // Suntech Industries
        systemDetails: {
          totalCapacity: 50,
          panelType: 'Monocrystalline 440W',
          panelCount: 114,
          inverterType: 'SolarEdge SE50K',
          estimatedProduction: 72000,
          batteryStorage: true,
          batteryCapacity: 50,
        },
        financialDetails: {
          totalCost: 2500000,
          currency: 'INR',
          incentives: [
            { name: 'Government Subsidy', amount: 300000 },
            { name: 'Tax Credit', amount: 200000 },
          ],
          netCost: 2000000,
          paybackPeriod: 4.5,
          financingOptions: [
            {
              name: 'Full Payment',
              termMonths: 0,
              monthlyPayment: 0,
              interestRate: 0,
              downPayment: 2000000,
            },
            {
              name: 'EMI - 5 Years',
              termMonths: 60,
              monthlyPayment: 40000,
              interestRate: 7.5,
              downPayment: 400000,
            },
          ],
          selectedFinancing: 'EMI - 5 Years',
        },
        status: 'accepted',
        approvalStatus: 'admin_approved',
        estimatedInstallDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: 'High priority project. Client wants installation to begin ASAP.',
        createdBy: salesUser._id,
        documentUrl: 'https://example.com/proposals/suntech_proposal.pdf',
        history: [
          {
            version: 1,
            status: 'draft',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            notes: 'Initial draft created',
          },
          {
            version: 1,
            status: 'sent',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            notes: 'Proposal sent to client',
          },
          {
            version: 1,
            status: 'accepted',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            notes: 'Client accepted proposal',
          },
        ],
        approvalHistory: [
          {
            approvedBy: salesUser._id,
            status: 'submitted',
            comments: 'Proposal submitted for approval',
            approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          },
          {
            approvedBy: projectManagerUser._id,
            status: 'approved',
            comments: 'Approved by manager',
            approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          },
          {
            approvedBy: adminUser._id,
            status: 'approved',
            comments: 'Final approval by admin',
            approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          },
        ],
        finalApproval: {
          approvedBy: adminUser._id,
          approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          comments: 'Final approval granted',
        },
      },
      {
        title: 'Residential Society Solar Setup',
        lead: createdLeads[1]._id,
        customer: createdCustomers[1]._id, // Green Homes Society
        systemDetails: {
          totalCapacity: 30,
          panelType: 'Polycrystalline 330W',
          panelCount: 91,
          inverterType: 'Growatt 30kW',
          estimatedProduction: 45000,
          batteryStorage: false,
          batteryCapacity: 0,
        },
        financialDetails: {
          totalCost: 1200000,
          currency: 'INR',
          incentives: [
            { name: 'Government Subsidy', amount: 150000 },
          ],
          netCost: 1050000,
          paybackPeriod: 5.2,
          financingOptions: [
            {
              name: 'Full Payment',
              termMonths: 0,
              monthlyPayment: 0,
              interestRate: 0,
              downPayment: 1050000,
            },
            {
              name: 'EMI - 3 Years',
              termMonths: 36,
              monthlyPayment: 33000,
              interestRate: 8,
              downPayment: 200000,
            },
          ],
          selectedFinancing: 'Full Payment',
        },
        status: 'accepted',
        approvalStatus: 'admin_approved',
        estimatedInstallDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        notes: 'Society has allocated rooftop space for the installation',
        createdBy: salesUser._id,
        documentUrl: 'https://example.com/proposals/greenhomes_proposal.pdf',
        history: [
          {
            version: 1,
            status: 'draft',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
            notes: 'Initial draft created',
          },
          {
            version: 1,
            status: 'sent',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
            notes: 'Proposal sent to society secretary',
          },
          {
            version: 1,
            status: 'negotiating',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            notes: 'Society requested payment terms modification',
          },
          {
            version: 1,
            status: 'accepted',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            notes: 'Society board accepted the proposal',
          },
        ],
        approvalHistory: [
          {
            approvedBy: salesUser._id,
            status: 'submitted',
            comments: 'Proposal submitted for approval',
            approvedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
          },
          {
            approvedBy: projectManagerUser._id,
            status: 'approved',
            comments: 'Approved by manager',
            approvedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago
          },
          {
            approvedBy: adminUser._id,
            status: 'approved',
            comments: 'Final approval by admin',
            approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
          },
        ],
        finalApproval: {
          approvedBy: adminUser._id,
          approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
          comments: 'Final approval granted',
        },
      },
      {
        title: 'Government School Solar Project',
        lead: createdLeads[0]._id, // Reusing a lead as reference
        customer: createdCustomers[2]._id, // Government School
        systemDetails: {
          totalCapacity: 20,
          panelType: 'Bifacial 400W',
          panelCount: 50,
          inverterType: 'ABB 20kW',
          estimatedProduction: 32000,
          batteryStorage: true,
          batteryCapacity: 30,
        },
        financialDetails: {
          totalCost: 1000000,
          currency: 'INR',
          incentives: [
            { name: 'Government Education Grant', amount: 400000 },
          ],
          netCost: 600000,
          paybackPeriod: 3.0,
          financingOptions: [
            {
              name: 'Government Funded',
              termMonths: 0,
              monthlyPayment: 0,
              interestRate: 0,
              downPayment: 600000,
            },
          ],
          selectedFinancing: 'Government Funded',
        },
        status: 'negotiating',
        approvalStatus: 'manager_approved',
        estimatedInstallDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        notes: 'Awaiting final government department approval',
        createdBy: salesUser._id,
        documentUrl: 'https://example.com/proposals/govtschool_proposal.pdf',
        history: [
          {
            version: 1,
            status: 'draft',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            notes: 'Initial draft created',
          },
          {
            version: 1,
            status: 'sent',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
            notes: 'Proposal sent to school principal',
          },
          {
            version: 1,
            status: 'negotiating',
            updatedBy: salesUser._id,
            updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
            notes: 'School forwarded proposal to education department for approval',
          },
        ],
        approvalHistory: [
          {
            approvedBy: salesUser._id,
            status: 'submitted',
            comments: 'Proposal submitted for approval',
            approvedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), // 23 days ago
          },
          {
            approvedBy: projectManagerUser._id,
            status: 'approved',
            comments: 'Approved by manager with educational discount',
            approvedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
          },
        ],
      },
    ];
    
    const createdProposals = await Proposal.insertMany(proposals);
    console.log(`Created ${createdProposals.length} demo proposals`);

    // Create projects for accepted proposals
    await Project.deleteMany({});
    
    const projects = [
      {
        proposal: createdProposals[0]._id, // Suntech Industries proposal
        customer: createdCustomers[0]._id, // Suntech Industries
        contractNumber: 'PROJ-2023-001',
        status: 'in_progress',
        timeline: {
          contractSigned: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          permitSubmitted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          permitApproved: null,
          installationStart: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          installationEnd: null,
          inspectionDate: null,
          gridConnectionDate: null,
          completionDate: null,
        },
        projectManager: projectManagerUser._id,
        installationTeam: [technicianUser._id],
        equipmentUsed: [
          {
            type: 'panel',
            manufacturer: 'SunPower',
            model: 'SPR-X22-440',
            serialNumber: 'SP00123456',
            quantity: 114,
          },
          {
            type: 'inverter',
            manufacturer: 'SolarEdge',
            model: 'SE50K',
            serialNumber: 'SE00789012',
            quantity: 1,
          },
          {
            type: 'battery',
            manufacturer: 'Tesla',
            model: 'Powerwall',
            serialNumber: 'TP00456789',
            quantity: 5,
          },
        ],
        permitDetails: {
          permitNumber: 'PER-2023-12345',
          issuedBy: 'Municipal Corporation',
          applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          approvalDate: null,
          documents: [
            {
              name: 'Application Form',
              fileUrl: 'https://example.com/permits/suntech/application.pdf',
            },
            {
              name: 'Site Plan',
              fileUrl: 'https://example.com/permits/suntech/siteplan.pdf',
            },
          ],
        },
        paymentSchedule: [
          {
            description: 'Advance Payment',
            amount: 400000,
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            status: 'paid',
            paymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            paymentMethod: 'Bank Transfer',
          },
          {
            description: 'Post Permitting Payment',
            amount: 600000,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            status: 'pending',
            paymentDate: null,
            paymentMethod: null,
          },
          {
            description: 'Post Installation Payment',
            amount: 600000,
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
            status: 'pending',
            paymentDate: null,
            paymentMethod: null,
          },
          {
            description: 'Final Payment',
            amount: 400000,
            dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
            status: 'pending',
            paymentDate: null,
            paymentMethod: null,
          },
        ],
        notes: [
          {
            text: 'Client wants blue panels if possible for aesthetics',
            createdBy: salesUser._id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            text: 'Need to coordinate with building maintenance for access',
            createdBy: projectManagerUser._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
        ],
        documents: [
          {
            name: 'Signed Contract',
            category: 'Legal',
            fileUrl: 'https://example.com/projects/suntech/contract.pdf',
            uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            name: 'Technical Specifications',
            category: 'Technical',
            fileUrl: 'https://example.com/projects/suntech/specifications.pdf',
            uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
        ],
      },
      {
        proposal: createdProposals[1]._id, // Green Homes Society proposal
        customer: createdCustomers[1]._id, // Green Homes Society
        contractNumber: 'PROJ-2023-002',
        status: 'planning',
        timeline: {
          contractSigned: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          permitSubmitted: null,
          permitApproved: null,
          installationStart: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          installationEnd: null,
          inspectionDate: null,
          gridConnectionDate: null,
          completionDate: null,
        },
        projectManager: projectManagerUser._id,
        installationTeam: [technicianUser._id],
        equipmentUsed: [
          {
            type: 'panel',
            manufacturer: 'Trina Solar',
            model: 'TSM-330',
            serialNumber: 'TS00456789',
            quantity: 91,
          },
          {
            type: 'inverter',
            manufacturer: 'Growatt',
            model: 'MAX 30KTL3',
            serialNumber: 'GW00123456',
            quantity: 1,
          },
        ],
        permitDetails: {
          permitNumber: null,
          issuedBy: 'Municipal Corporation',
          applicationDate: null,
          approvalDate: null,
          documents: [
            {
              name: 'Draft Application',
              fileUrl: 'https://example.com/permits/greenhomes/draft_application.pdf',
            },
          ],
        },
        paymentSchedule: [
          {
            description: 'Full Payment',
            amount: 1050000,
            dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            status: 'paid',
            paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            paymentMethod: 'Bank Transfer',
          },
        ],
        notes: [
          {
            text: 'Society committee will provide keys for rooftop access',
            createdBy: salesUser._id,
            createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          },
          {
            text: 'Need to schedule committee presentation before work begins',
            createdBy: projectManagerUser._id,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          },
        ],
        documents: [
          {
            name: 'Signed Contract',
            category: 'Legal',
            fileUrl: 'https://example.com/projects/greenhomes/contract.pdf',
            uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          },
          {
            name: 'Rooftop Layout Plan',
            category: 'Technical',
            fileUrl: 'https://example.com/projects/greenhomes/rooftop_layout.pdf',
            uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
          },
        ],
      },
    ];
    
    const createdProjects = await Project.insertMany(projects);
    console.log(`Created ${createdProjects.length} demo projects`);

    // Create service requests
    await ServiceRequest.deleteMany({});
    
    const serviceRequests = [
      {
        project: createdProjects[0]._id, // Suntech Industries project
        customer: createdCustomers[0]._id, // Suntech Industries as customer
        requestType: 'inspection',
        title: 'Pre-Installation Site Inspection',
        description: 'Need to conduct a detailed site inspection before installation begins to verify roof load capacity and electrical panel compatibility.',
        priority: 'high',
        status: 'scheduled',
        assignedTo: technicianUser._id,
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        estimatedHours: 4,
        notes: [
          {
            text: 'Client contact for site access: Rajesh Kumar (9876543210)',
            createdBy: salesUser._id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            text: 'Need to bring specialized equipment for load testing',
            createdBy: technicianUser._id,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          },
        ],
        cost: {
          laborCost: 2000,
          partsCost: 0,
          totalCost: 2000,
          invoiced: false,
        },
        warrantyRelated: false,
      },
      {
        project: createdProjects[1]._id, // Green Homes Society project
        customer: createdCustomers[1]._id, // Green Homes Society as customer
        requestType: 'system_upgrade',
        title: 'Battery Storage Addition',
        description: 'Client wants to add battery storage to existing solar installation plan before installation begins.',
        priority: 'medium',
        status: 'new',
        scheduledDate: null,
        estimatedHours: 2,
        notes: [
          {
            text: 'Need to propose options for battery systems compatible with planned Growatt inverter',
            createdBy: salesUser._id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
        ],
        cost: {
          laborCost: 5000,
          partsCost: 350000,
          totalCost: 355000,
          invoiced: false,
        },
        warrantyRelated: false,
      },
      {
        project: null, // No project as this is for a past customer
        customer: createdCustomers[2]._id, // Government School as customer
        requestType: 'maintenance',
        title: 'Annual Maintenance Check',
        description: 'Routine annual maintenance check for previously installed solar system including panel cleaning and connection inspection.',
        priority: 'low',
        status: 'completed',
        assignedTo: technicianUser._id,
        scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        completionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        estimatedHours: 3,
        actualHours: 2.5,
        notes: [
          {
            text: 'System functioning within normal parameters. Cleaned panels and checked connections.',
            createdBy: technicianUser._id,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          },
        ],
        resolution: {
          description: 'Performed routine maintenance. All systems operational.',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          resolvedBy: technicianUser._id,
        },
        customerFeedback: {
          rating: 5,
          comments: 'Technician was very professional and thorough.',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        },
        cost: {
          laborCost: 1500,
          partsCost: 0,
          totalCost: 1500,
          invoiced: true,
          invoiceNumber: 'INV-2023-001',
          invoiceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          paymentStatus: 'paid',
        },
        warrantyRelated: false,
      },
      {
        project: null,
        customer: createdCustomers[3]._id, // Ashok Farms as customer
        requestType: 'repair',
        title: 'Inverter Error Troubleshooting',
        description: 'Customer reports intermittent error codes on inverter display. Need to diagnose and repair.',
        priority: 'critical',
        status: 'in_progress',
        assignedTo: technicianUser._id,
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        estimatedHours: 2,
        notes: [
          {
            text: 'Initial diagnosis suggests firmware issue. Will attempt firmware upgrade.',
            createdBy: technicianUser._id,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          },
        ],
        cost: {
          laborCost: 3000,
          partsCost: 0,
          totalCost: 3000,
          invoiced: false,
        },
        warrantyRelated: true,
      },
      {
        project: createdProjects[0]._id,
        customer: createdCustomers[4]._id, // Residential Customer as customer
        requestType: 'other',
        title: 'Site Security Assessment',
        description: 'Conduct security assessment for solar equipment installation area. Client concerned about equipment safety.',
        priority: 'medium',
        status: 'new',
        scheduledDate: null,
        estimatedHours: 3,
        notes: [
          {
            text: 'Need to coordinate with security team at the facility.',
            createdBy: projectManagerUser._id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
        ],
        cost: {
          laborCost: 4500,
          partsCost: 0,
          totalCost: 4500,
          invoiced: false,
        },
        warrantyRelated: false,
      },
    ];
    
    const createdServiceRequests = await ServiceRequest.insertMany(serviceRequests);
    console.log(`Created ${createdServiceRequests.length} demo service requests`);
    
    console.log('Demo data creation completed successfully!');
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error(`Error creating demo data: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Execute the function if this script is run directly
if (require.main === module) {
  createDemoData();
}

module.exports = createDemoData;