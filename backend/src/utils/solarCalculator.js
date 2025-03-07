/**
 * Solar System Calculator Utility
 * 
 * Provides calculations for solar system planning, energy production,
 * financial analysis, and other solar-specific functionality.
 */

/**
 * Calculate recommended solar system size based on energy usage
 * @param {Object} params - Calculation parameters
 * @param {number} params.monthlyUsage - Monthly electricity usage in kWh
 * @param {number} params.offsetPercentage - Desired offset percentage (default: 100)
 * @param {number} params.sunHoursPerDay - Average sun hours per day at location
 * @param {number} params.systemLosses - System losses percentage (default: 14)
 * @returns {Object} - Recommended system specifications
 */
const calculateSystemSize = (params) => {
  const { 
    monthlyUsage, 
    offsetPercentage = 100, 
    sunHoursPerDay, 
    systemLosses = 14 
  } = params;
  
  // Validate input parameters
  if (!monthlyUsage || !sunHoursPerDay) {
    throw new Error('Monthly usage and sun hours per day are required');
  }
  
  if (monthlyUsage <= 0 || sunHoursPerDay <= 0) {
    throw new Error('Monthly usage and sun hours must be positive values');
  }
  
  // Calculate daily usage
  const dailyUsage = monthlyUsage / 30;
  
  // Calculate target production with offset
  const targetProduction = dailyUsage * (offsetPercentage / 100);
  
  // Calculate system size in kW
  // Formula: (Daily Usage * (1 + Losses)) / Sun Hours
  const systemSizeKW = (targetProduction * (1 + systemLosses / 100)) / sunHoursPerDay;
  
  // Calculate number of panels (assuming 400W standard panels)
  const panelWattage = 400; // Standard panel wattage
  const numberOfPanels = Math.ceil((systemSizeKW * 1000) / panelWattage);
  
  // Calculate roof space required (assuming 2 sq.m per panel)
  const roofSpaceRequired = numberOfPanels * 2; // sq.m
  
  // Calculate annual production
  const annualProduction = systemSizeKW * sunHoursPerDay * 365 * (1 - systemLosses / 100);
  
  return {
    systemSizeKW: parseFloat(systemSizeKW.toFixed(2)),
    numberOfPanels,
    roofSpaceRequired: parseFloat(roofSpaceRequired.toFixed(2)),
    annualProduction: Math.round(annualProduction),
    dailyProduction: parseFloat((annualProduction / 365).toFixed(2)),
    monthlyProduction: parseFloat((annualProduction / 12).toFixed(2)),
  };
};

/**
 * Calculate financial metrics for a solar installation
 * @param {Object} params - Calculation parameters
 * @param {number} params.systemSizeKW - System size in kW
 * @param {number} params.installationCost - Total installation cost
 * @param {number} params.electricityRate - Current electricity rate in currency per kWh
 * @param {number} params.annualProduction - Estimated annual production in kWh
 * @param {number} params.annualDegradation - Annual panel degradation percentage (default: 0.5)
 * @param {number} params.electricityInflation - Annual electricity price inflation (default: 3)
 * @param {number} params.incentives - Government/utility incentives (default: 0)
 * @param {number} params.financingYears - Financing period in years (default: 0 for cash purchase)
 * @param {number} params.interestRate - Financing interest rate (default: 0)
 * @returns {Object} - Financial metrics
 */
const calculateFinancials = (params) => {
  const { 
    systemSizeKW, 
    installationCost, 
    electricityRate, 
    annualProduction,
    annualDegradation = 0.5, 
    electricityInflation = 3,
    incentives = 0,
    financingYears = 0,
    interestRate = 0
  } = params;
  
  // Validate input parameters
  if (!systemSizeKW || !installationCost || !electricityRate || !annualProduction) {
    throw new Error('System size, installation cost, electricity rate, and annual production are required');
  }
  
  // Calculate net cost after incentives
  const netCost = installationCost - incentives;
  
  // Calculate cost per watt
  const costPerWatt = netCost / (systemSizeKW * 1000);
  
  // Calculate first year savings
  const firstYearSavings = annualProduction * electricityRate;
  
  // Calculate lifetime production and savings (25 years)
  let totalProduction = 0;
  let totalSavings = 0;
  let productionThisYear = annualProduction;
  let electricityRateThisYear = electricityRate;
  
  // Array to store yearly data
  const yearlyData = [];
  
  for (let year = 1; year <= 25; year++) {
    // Add to total production
    totalProduction += productionThisYear;
    
    // Calculate savings this year
    const savingsThisYear = productionThisYear * electricityRateThisYear;
    totalSavings += savingsThisYear;
    
    // Store yearly data
    yearlyData.push({
      year,
      production: Math.round(productionThisYear),
      electricityRate: parseFloat(electricityRateThisYear.toFixed(4)),
      savings: parseFloat(savingsThisYear.toFixed(2)),
      cumulativeSavings: parseFloat(totalSavings.toFixed(2))
    });
    
    // Degrade production for next year
    productionThisYear *= (1 - annualDegradation / 100);
    
    // Increase electricity rate for next year
    electricityRateThisYear *= (1 + electricityInflation / 100);
  }
  
  // Calculate simple payback period (years)
  const paybackPeriod = netCost / firstYearSavings;
  
  // Calculate ROI
  const roi = (totalSavings - netCost) / netCost * 100;
  
  // Calculate levelized cost of energy (LCOE)
  const lcoe = netCost / totalProduction;
  
  // Financing calculations
  let monthlyPayment = 0;
  let totalPayments = 0;
  let financingInterest = 0;
  
  if (financingYears > 0 && interestRate > 0) {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = financingYears * 12;
    
    // Monthly payment formula: P * r * (1+r)^n / ((1+r)^n - 1)
    monthlyPayment = netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / 
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
                     
    totalPayments = monthlyPayment * numPayments;
    financingInterest = totalPayments - netCost;
  }
  
  return {
    netCost: parseFloat(netCost.toFixed(2)),
    costPerWatt: parseFloat(costPerWatt.toFixed(2)),
    firstYearSavings: parseFloat(firstYearSavings.toFixed(2)),
    totalProduction: Math.round(totalProduction),
    totalSavings: parseFloat(totalSavings.toFixed(2)),
    paybackPeriod: parseFloat(paybackPeriod.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
    lcoe: parseFloat(lcoe.toFixed(4)),
    financing: {
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalPayments: parseFloat(totalPayments.toFixed(2)),
      totalInterest: parseFloat(financingInterest.toFixed(2))
    },
    yearlyData
  };
};

/**
 * Calculate monthly production based on location and system specifications
 * @param {Object} params - Calculation parameters
 * @param {number} params.systemSizeKW - System size in kW
 * @param {Object} params.location - Location coordinates or predefined location data
 * @param {number} params.tilt - Panel tilt angle in degrees
 * @param {number} params.azimuth - Panel azimuth angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @param {number} params.systemLosses - System losses percentage (default: 14)
 * @returns {Object} - Monthly production data
 */
const calculateMonthlyProduction = (params) => {
  const { 
    systemSizeKW, 
    location, 
    tilt, 
    azimuth, 
    systemLosses = 14 
  } = params;
  
  // Validate input parameters
  if (!systemSizeKW || !location) {
    throw new Error('System size and location are required');
  }
  
  // Monthly production factors for different climate zones
  // These are simplified examples - in a real system would use NREL or similar data
  const climateZones = {
    'arid': [0.9, 0.95, 1.05, 1.1, 1.15, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9],
    'temperate': [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7],
    'tropical': [0.9, 0.9, 1.0, 1.0, 1.0, 0.9, 0.9, 0.9, 0.9, 1.0, 1.0, 1.0],
    'continental': [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.8, 0.7, 0.6]
  };
  
  // Determine climate zone based on location
  // This is a simplified approach - a real system would use coordinates and climate databases
  const climateZone = location.climateZone || 'temperate';
  const monthlyFactors = climateZones[climateZone] || climateZones.temperate;
  
  // Calculate base annual production
  const dailyProductionKWh = systemSizeKW * 4; // Assuming 4 sun hours average for calculation
  const annualProduction = dailyProductionKWh * 365 * (1 - systemLosses / 100);
  
  // Apply tilt and azimuth adjustment
  // This is a simplified calculation - a real system would use more complex models
  let tiltFactor = 1.0;
  if (tilt < 10) {
    tiltFactor = 0.9; // Flat installations are less efficient
  } else if (tilt > 40) {
    tiltFactor = 0.95; // Very steep tilts may not be optimal
  }
  
  // Azimuth adjustment (assuming Northern Hemisphere)
  let azimuthFactor = 1.0;
  if (azimuth < 90 || azimuth > 270) {
    azimuthFactor = 0.85; // North-facing is suboptimal
  } else if (azimuth < 135 || azimuth > 225) {
    azimuthFactor = 0.95; // East/West-facing is slightly suboptimal
  }
  
  // Calculate monthly production
  const averageMonthlyProduction = annualProduction / 12;
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthlyProduction = monthlyFactors.map((factor, index) => {
    return {
      month: monthNames[index],
      productionKWh: Math.round(averageMonthlyProduction * factor * tiltFactor * azimuthFactor),
      factor: parseFloat((factor * tiltFactor * azimuthFactor).toFixed(2))
    };
  });
  
  // Calculate total adjusted annual production
  const adjustedAnnualProduction = monthlyProduction.reduce(
    (sum, month) => sum + month.productionKWh, 0
  );
  
  return {
    systemSizeKW,
    location: {
      ...location,
      climateZone
    },
    systemConfiguration: {
      tilt,
      azimuth,
      tiltFactor: parseFloat(tiltFactor.toFixed(2)),
      azimuthFactor: parseFloat(azimuthFactor.toFixed(2)),
      systemLosses
    },
    monthlyProduction,
    dailyAverageKWh: parseFloat((adjustedAnnualProduction / 365).toFixed(2)),
    adjustedAnnualProduction
  };
};

/**
 * Calculate energy usage offset percentage
 * @param {Object} params - Calculation parameters
 * @param {number} params.annualProduction - Annual system production in kWh
 * @param {number} params.annualConsumption - Annual energy consumption in kWh
 * @returns {Object} - Offset analysis
 */
const calculateOffset = (params) => {
  const { annualProduction, annualConsumption } = params;
  
  // Validate input parameters
  if (!annualProduction || !annualConsumption) {
    throw new Error('Annual production and annual consumption are required');
  }
  
  // Calculate offset percentage
  const offsetPercentage = (annualProduction / annualConsumption) * 100;
  
  // Calculate surplus or deficit
  const difference = annualProduction - annualConsumption;
  const hasSurplus = difference > 0;
  
  return {
    annualProduction,
    annualConsumption,
    offsetPercentage: parseFloat(offsetPercentage.toFixed(2)),
    difference: Math.abs(Math.round(difference)),
    hasSurplus,
    status: offsetPercentage >= 100 ? 'Net positive' : 'Partial offset'
  };
};

/**
 * Calculate CO2 emissions reduction from solar system
 * @param {Object} params - Calculation parameters
 * @param {number} params.annualProduction - Annual system production in kWh
 * @param {number} params.emissionsFactor - CO2 emissions factor in kg/kWh (default based on region)
 * @param {string} params.region - Region for emissions calculation (default: 'US')
 * @returns {Object} - Emissions reduction analysis
 */
const calculateEmissionsReduction = (params) => {
  const { annualProduction, emissionsFactor, region = 'US' } = params;
  
  // Validate input parameters
  if (!annualProduction) {
    throw new Error('Annual production is required');
  }
  
  // Emissions factors by region (kg CO2 per kWh)
  // Source: International Energy Agency (simplified)
  const emissionsFactors = {
    'US': 0.38,
    'EU': 0.23,
    'China': 0.55,
    'India': 0.71,
    'World': 0.46
  };
  
  // Use provided factor or lookup from region
  const factor = emissionsFactor || emissionsFactors[region] || emissionsFactors.World;
  
  // Calculate annual CO2 reduction in kg
  const annualCO2Reduction = annualProduction * factor;
  
  // Calculate equivalents
  const gasConsumedGallons = annualCO2Reduction / 8.89; // 8.89 kg CO2 per gallon
  const treesPlanted = annualCO2Reduction / 21; // 21 kg CO2 per tree per year
  const carMilesDriven = annualCO2Reduction / 0.39; // 0.39 kg CO2 per mile
  
  return {
    annualProduction,
    emissionsFactor: factor,
    region,
    annualCO2Reduction: Math.round(annualCO2Reduction),
    twentyFiveYearCO2Reduction: Math.round(annualCO2Reduction * 25),
    equivalents: {
      gasConsumedGallons: Math.round(gasConsumedGallons),
      treesPlanted: Math.round(treesPlanted),
      carMilesDriven: Math.round(carMilesDriven)
    }
  };
};

module.exports = {
  calculateSystemSize,
  calculateFinancials,
  calculateMonthlyProduction,
  calculateOffset,
  calculateEmissionsReduction
};