// This utility script initializes localStorage with organized sample data for the ERP demo
// following a proper business flow: Customers → Leads → Proposals → Projects → Service Requests

const initializeLocalStorage = () => {
  console.log('Checking localStorage data...');
  
  // Only initialize data if it doesn't exist
  const hasExistingData = {
    customers: !!localStorage.getItem('customers'),
    leads: !!localStorage.getItem('leads'),
    proposals: !!localStorage.getItem('proposals'),
    projects: !!localStorage.getItem('projects'),
    serviceRequests: !!localStorage.getItem('serviceRequests')
  };
  
  console.log('Existing data check:', hasExistingData);
  
  // If we have all data already, don't initialize
  if (hasExistingData.customers && 
      hasExistingData.leads && 
      hasExistingData.proposals && 
      hasExistingData.projects && 
      hasExistingData.serviceRequests) {
    console.log('All data already exists in localStorage. Keeping existing data.');
    return;
  }
  
  console.log('Initializing missing localStorage data...');
  
  // Step 2: Create customers - always the starting point
  if (!hasExistingData.customers) {
    const customers = [
      {
      _id: 'cust-1',
      name: 'Rajan Sharma',
      email: 'rajan.sharma@example.com',
      phone: '+91 9876543210',
      address: '123 Willow St, Wayanad, Kerala',
      type: 'residential',
      status: 'active',
      contactPerson: 'Rajan Sharma',
      createdAt: '2023-01-15T09:30:00Z',
      totalProjects: 1,
      lifetimeValue: 120000
    },
    {
      _id: 'cust-2',
      name: 'Green Valley Resort',
      email: 'management@greenvalley.com',
      phone: '+91 9876543211',
      address: 'Green Valley Road, Munnar, Kerala',
      type: 'commercial',
      status: 'active',
      contactPerson: 'Maya Menon',
      alternatePhone: '+91 9876543299',
      createdAt: '2023-02-05T11:20:00Z',
      totalProjects: 1,
      lifetimeValue: 350000
    },
    {
      _id: 'cust-3',
      name: 'Govt. FHC Kakkodi',
      email: 'fhc.kakkodi@gov.in',
      phone: '+91 9876543212',
      address: 'Govt. FHC, Kakkodi, Kozhikode',
      type: 'government',
      status: 'active',
      contactPerson: 'Dr. Suresh Kumar',
      gstNumber: 'GST9988776655',
      createdAt: '2023-01-20T14:45:00Z',
      totalProjects: 2,
      lifetimeValue: 220000
    },
    {
      _id: 'cust-4',
      name: 'Janatha Home World',
      email: 'info@janathaworld.com',
      phone: '+91 9876543213',
      address: '45 Main Road, Perinthalmanna',
      type: 'commercial',
      status: 'active',
      contactPerson: 'Abdul Rahman',
      gstNumber: 'GST1122334455',
      createdAt: '2023-02-10T10:15:00Z',
      totalProjects: 1,
      lifetimeValue: 180000
    },
    {
      _id: 'cust-5',
      name: 'KM Rexine',
      email: 'office@kmrexine.com',
      phone: '+91 9876543214',
      address: 'Industrial Zone, Perinthalmanna',
      type: 'industrial',
      status: 'active',
      contactPerson: 'Mohammed Hasan',
      gstNumber: 'GST2233445566',
      createdAt: '2023-01-25T09:00:00Z',
      totalProjects: 2,
      lifetimeValue: 450000
    }
  ];
    localStorage.setItem('customers', JSON.stringify(customers));
    console.log('Sample customers initialized:', customers.length);
  } else {
    console.log('Using existing customers data');
  }
  
  // Step 3: Create leads - linked to customers
  if (!hasExistingData.leads) {
    const leads = [
    {
      _id: 'lead-1',
      customerId: 'cust-1', // Rajan Sharma
      name: 'Rajan Sharma',
      email: 'rajan.sharma@example.com',
      phone: '+91 9876543210',
      address: '123 Willow St, Wayanad, Kerala',
      source: 'Website',
      type: 'residential',
      status: 'qualified',
      requirement: 'Looking for 5kW home solar setup',
      notes: 'Interested in battery backup options',
      assignedTo: 'Anjali',
      createdAt: '2023-02-15T10:00:00Z'
    },
    {
      _id: 'lead-2',
      customerId: 'cust-2', // Green Valley Resort
      name: 'Green Valley Resort',
      email: 'management@greenvalley.com',
      phone: '+91 9876543211',
      address: 'Hill Road, Wayanad, Kerala',
      source: 'Referral',
      type: 'commercial',
      status: 'proposal',
      requirement: 'Need 30kW system for resort operations',
      notes: 'Eco-tourism resort with sustainability focus',
      assignedTo: 'Rajesh',
      createdAt: '2023-03-01T14:30:00Z'
    },
    {
      _id: 'lead-3',
      customerId: 'cust-3', // Govt. FHC Kakkodi
      name: 'Govt. FHC Kakkodi',
      email: 'fhc.kakkodi@gov.in',
      phone: '+91 9876543212',
      address: 'Govt. FHC, Kakkodi, Kozhikode',
      source: 'Government Tender',
      type: 'government',
      status: 'new',
      requirement: 'Solar system for healthcare facility',
      notes: 'Part of green healthcare initiative',
      assignedTo: 'Priya',
      createdAt: '2023-02-20T11:15:00Z'
    },
    {
      _id: 'lead-4',
      customerId: 'cust-4', // Janatha Home World
      name: 'Janatha Home World',
      email: 'info@janathaworld.com',
      phone: '+91 9876543213',
      address: '45 Main Road, Perinthalmanna',
      source: 'Direct Call',
      type: 'commercial',
      status: 'contacting',
      requirement: 'Interested in showroom rooftop system',
      notes: 'Want to showcase solar to customers',
      assignedTo: 'Rajesh',
      createdAt: '2023-03-05T09:30:00Z'
    },
    {
      _id: 'lead-5',
      customerId: 'cust-5', // KM Rexine
      name: 'KM Rexine',
      email: 'office@kmrexine.com',
      phone: '+91 9876543214',
      address: 'Industrial Zone, Perinthalmanna',
      source: 'Trade Show',
      type: 'industrial',
      status: 'qualified',
      requirement: 'Need 50kW industrial system',
      notes: 'Looking for cost reduction on power',
      assignedTo: 'Anjali',
      createdAt: '2023-02-28T13:45:00Z'
    }
  ];
    localStorage.setItem('leads', JSON.stringify(leads));
    console.log('Sample leads initialized:', leads.length);
  } else {
    console.log('Using existing leads data');
  }
  
  // Step 4: Create proposals - linked to leads
  if (!hasExistingData.proposals) {
    const proposals = [
    {
      _id: 'prop-1',
      lead: 'lead-1', // Rajan Sharma
      title: 'Residential 5kW Solar System - Sharma Residence',
      systemDetails: {
        totalCapacity: 5,
        panelType: 'Jinko Solar 330W',
        panelCount: 15,
        inverterType: 'Growatt 5kW',
        estimatedProduction: 7500,
        batteryStorage: true,
        batteryCapacity: 10
      },
      financialDetails: {
        totalCost: 350000,
        incentives: [
          { name: 'Government Subsidy', amount: 60000 },
          { name: 'Early Adopter Discount', amount: 15000 }
        ],
        netCost: 275000,
        paybackPeriod: 4.5,
        financingOptions: [
          {
            name: 'Full Payment',
            termMonths: 0,
            monthlyPayment: 0,
            interestRate: 0,
            downPayment: 275000
          },
          {
            name: '3-Year Financing',
            termMonths: 36,
            monthlyPayment: 8500,
            interestRate: 8.5,
            downPayment: 50000
          }
        ],
        selectedFinancing: '3-Year Financing'
      },
      status: 'accepted',
      estimatedInstallDate: '2023-04-15T00:00:00Z',
      notes: 'Customer particularly interested in battery backup for power outages.',
      createdAt: '2023-03-10T11:30:00Z',
      createdBy: {
        _id: 'user-1',
        name: 'Anjali Singh'
      },
      version: 1
    },
    {
      _id: 'prop-2',
      lead: 'lead-2', // Green Valley Resort
      title: 'Commercial 30kW System - Green Valley Resort',
      systemDetails: {
        totalCapacity: 30,
        panelType: 'Canadian Solar 400W',
        panelCount: 75,
        inverterType: 'SMA Sunny Tripower 30kW',
        estimatedProduction: 45000,
        batteryStorage: true,
        batteryCapacity: 40
      },
      financialDetails: {
        totalCost: 1800000,
        incentives: [
          { name: 'Commercial Tax Credit', amount: 300000 },
          { name: 'Green Tourism Incentive', amount: 150000 }
        ],
        netCost: 1350000,
        paybackPeriod: 3.8,
        financingOptions: [
          {
            name: 'Full Payment',
            termMonths: 0,
            monthlyPayment: 0,
            interestRate: 0,
            downPayment: 1350000
          },
          {
            name: '5-Year Financing',
            termMonths: 60,
            monthlyPayment: 26000,
            interestRate: 7.5,
            downPayment: 200000
          }
        ],
        selectedFinancing: '5-Year Financing'
      },
      status: 'sent',
      estimatedInstallDate: '2023-05-20T00:00:00Z',
      notes: 'Resort wants to promote eco-friendly image to guests.',
      createdAt: '2023-03-15T14:45:00Z',
      createdBy: {
        _id: 'user-2',
        name: 'Rajesh Kumar'
      },
      version: 1
    },
    {
      _id: 'prop-3',
      lead: 'lead-5', // KM Rexine
      title: 'Industrial 50kW System - KM Rexine Factory',
      systemDetails: {
        totalCapacity: 50,
        panelType: 'Trina Solar 500W',
        panelCount: 100,
        inverterType: 'ABB TRIO-50.0',
        estimatedProduction: 75000,
        batteryStorage: false,
        batteryCapacity: 0
      },
      financialDetails: {
        totalCost: 2500000,
        incentives: [
          { name: 'Industrial Energy Efficiency Rebate', amount: 400000 },
          { name: 'Bulk Purchase Discount', amount: 150000 }
        ],
        netCost: 1950000,
        paybackPeriod: 3.2,
        financingOptions: [
          {
            name: 'Full Payment',
            termMonths: 0,
            monthlyPayment: 0,
            interestRate: 0,
            downPayment: 1950000
          },
          {
            name: '4-Year Financing',
            termMonths: 48,
            monthlyPayment: 47000,
            interestRate: 7.0,
            downPayment: 300000
          }
        ],
        selectedFinancing: '4-Year Financing'
      },
      status: 'negotiating',
      estimatedInstallDate: '2023-06-10T00:00:00Z',
      notes: 'Customer primarily focused on reducing operational costs.',
      createdAt: '2023-03-20T10:15:00Z',
      createdBy: {
        _id: 'user-1',
        name: 'Anjali Singh'
      },
      version: 2
    }
  ];
    localStorage.setItem('proposals', JSON.stringify(proposals));
    console.log('Sample proposals initialized:', proposals.length);
  } else {
    console.log('Using existing proposals data');
  }
  
  // Step 5: Create projects - linked to proposals and customers
  if (!hasExistingData.projects) {
    const projects = [
    {
      _id: 'proj-1',
      name: '5kW Residential Installation - Sharma',
      customer: 'cust-1', // Rajan Sharma
      proposalId: 'prop-1',
      contractNumber: 'PRJ2023-001',
      location: 'Wayanad, Kerala',
      status: 'completed',
      type: 'residential',
      startDate: '2023-04-20T00:00:00Z',
      targetCompletionDate: '2023-05-15T00:00:00Z',
      actualCompletionDate: '2023-05-10T00:00:00Z',
      progress: 100,
      capacity: 5,
      budget: 275000,
      actualCost: 268000,
      createdAt: '2023-03-25T09:00:00Z',
      notes: 'Installation completed ahead of schedule. Customer very satisfied.'
    },
    {
      _id: 'proj-2',
      name: '30kW Commercial System - Green Valley',
      customer: 'cust-2', // Green Valley Resort
      proposalId: 'prop-2',
      contractNumber: 'PRJ2023-002',
      location: 'Munnar, Kerala',
      status: 'planning',
      type: 'commercial',
      startDate: '2023-06-01T00:00:00Z',
      targetCompletionDate: '2023-07-15T00:00:00Z',
      progress: 15,
      capacity: 30,
      budget: 1350000,
      createdAt: '2023-03-30T15:30:00Z',
      notes: 'Equipment procurement in progress. Site assessment completed.'
    }
  ];
    localStorage.setItem('projects', JSON.stringify(projects));
    console.log('Sample projects initialized:', projects.length);
  } else {
    console.log('Using existing projects data');
  }
  
  // Step 6: Create service requests - linked to projects
  if (!hasExistingData.serviceRequests) {
    const serviceRequests = [
    {
      _id: 'serv-1',
      title: 'Annual Maintenance - Sharma Residence',
      projectId: 'proj-1',
      customer: 'cust-1', // Rajan Sharma
      status: 'scheduled',
      requestType: 'maintenance',
      priority: 'medium',
      description: 'Regular annual maintenance check for the solar system.',
      createdAt: '2023-05-20T10:00:00Z',
      scheduledDate: '2023-06-15T09:00:00Z',
      assignedTo: 'Technician Team A'
    },
    {
      _id: 'serv-2',
      title: 'Inverter Warning Light - Sharma Residence',
      projectId: 'proj-1',
      customer: 'cust-1', // Rajan Sharma
      status: 'completed',
      requestType: 'repair',
      priority: 'high',
      description: 'Customer reported warning light on inverter display.',
      createdAt: '2023-05-25T14:30:00Z',
      scheduledDate: '2023-05-26T10:00:00Z',
      completedDate: '2023-05-26T11:45:00Z',
      resolution: 'Firmware updated and system reset. All systems normal.',
      assignedTo: 'Technician Suresh'
    }
  ];
    localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));
    console.log('Sample service requests initialized:', serviceRequests.length);
  } else {
    console.log('Using existing service requests data');
  }
  
  // Only update project counts for customers if we initialized both customers and projects
  if (!hasExistingData.customers && !hasExistingData.projects) {
    // Get the customers and projects from localStorage (newly initialized)
    const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Update project counts for customers
    const updatedCustomers = storedCustomers.map(customer => {
      // Count projects for this customer
      const customerProjects = storedProjects.filter(project => project.customer === customer._id);
      
      // Update the customer with the correct project count
      return {
        ...customer,
        totalProjects: customerProjects.length
      };
    });
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    console.log('Updated customer project counts');
  }
  
  console.log('Data initialization complete!');
  console.log('------------------------------');
  console.log('Business flow established:');
  console.log('Customers → Leads → Proposals → Projects → Service Requests');
  console.log('------------------------------');
};

export default initializeLocalStorage;