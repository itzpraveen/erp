/**
 * Solar Calculation Service
 * Provides accurate calculations for solar system design and financial analysis
 */

// Constants for calculations
const STANDARD_TEST_CONDITIONS_IRRADIANCE = 1000; // W/m²
const EARTH_TILT = 23.45; // degrees
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Calculate system size based on energy usage and offset percentage
 * @param {Object} params
 * @param {Number} params.monthlyUsage - Average monthly electricity usage in kWh
 * @param {Number} params.offsetPercentage - Percentage of electricity usage to offset (0-200)
 * @param {Number} params.sunHoursPerDay - Average sun hours per day
 * @param {Number} params.systemLosses - System losses percentage (0-100)
 * @param {Object} params.panelData - Panel specifications
 * @returns {Object} System size calculation results
 */
const calculateSystemSize = (params) => {
  const {
    monthlyUsage = 1000,
    offsetPercentage = 100,
    sunHoursPerDay = 5,
    systemLosses = 14,
    panelData = { wattage: 400, efficiency: 20, dimensions: { length: 1.7, width: 1.0 } }
  } = params;

  try {
    // Calculate annual energy usage
    const annualUsage = monthlyUsage * 12;
    
    // Calculate desired production with offset
    const desiredProduction = (annualUsage * offsetPercentage) / 100;
    
    // Account for system losses
    const requiredProduction = desiredProduction / (1 - systemLosses / 100);
    
    // Calculate daily production needed
    const dailyProductionNeeded = requiredProduction / 365;
    
    // Calculate system size in kW DC
    const systemSizeKW = dailyProductionNeeded / sunHoursPerDay;
    
    // Calculate number of panels needed
    const panelWattage = panelData.wattage || 400; // Default to 400W if not specified
    const panelsNeeded = Math.ceil((systemSizeKW * 1000) / panelWattage);
    
    // Calculate roof space required
    const panelArea = (panelData.dimensions?.length || 1.7) * (panelData.dimensions?.width || 1.0);
    const roofSpaceRequired = Math.ceil(panelsNeeded * panelArea);
    
    // Calculate annual production
    const annualProduction = systemSizeKW * sunHoursPerDay * 365 * (1 - systemLosses / 100);
    
    // Calculate daily average production
    const dailyProduction = annualProduction / 365;
    
    // Calculate monthly production (simplified model based on hemispheric distribution)
    const northernHemisphereDistribution = [0.07, 0.075, 0.085, 0.09, 0.095, 0.1, 0.1, 0.095, 0.09, 0.085, 0.075, 0.07];
    const monthlyProduction = northernHemisphereDistribution.map(factor => 
      Math.round(annualProduction * factor));
    
    return {
      systemSizeKW: parseFloat(systemSizeKW.toFixed(2)),
      numberOfPanels: panelsNeeded,
      roofSpaceRequired: roofSpaceRequired,
      annualProduction: Math.round(annualProduction),
      dailyProduction: parseFloat(dailyProduction.toFixed(2)),
      monthlyProduction: monthlyProduction,
      panelWattage: panelWattage,
      systemLosses: systemLosses
    };
  } catch (error) {
    console.error('Error in calculateSystemSize:', error);
    throw new Error(`System size calculation failed: ${error.message}`);
  }
};

/**
 * Calculate financial metrics for solar system
 * @param {Object} params
 * @param {Number} params.systemSizeKW - System size in kW
 * @param {Number} params.installationCost - Total installation cost
 * @param {Number} params.electricityRate - Electricity rate in $/kWh
 * @param {Number} params.annualProduction - Annual energy production in kWh
 * @param {Number} params.annualDegradation - Annual panel degradation percentage
 * @param {Number} params.electricityInflation - Annual electricity price inflation percentage
 * @param {Number} params.incentives - Total incentives amount
 * @param {Number} params.financingYears - Financing term in years (0 for cash purchase)
 * @param {Number} params.interestRate - Annual interest rate for financing
 * @returns {Object} Financial calculation results
 */
const calculateFinancials = (params) => {
  const {
    systemSizeKW = 10,
    installationCost = 30000,
    electricityRate = 0.15,
    annualProduction = 14000,
    annualDegradation = 0.5,
    electricityInflation = 3.0,
    incentives = 0,
    financingYears = 0,
    interestRate = 4.5
  } = params;

  try {
    // Calculate net cost after incentives
    const netCost = installationCost - incentives;
    
    // Calculate cost per watt
    const costPerWatt = parseFloat((netCost / (systemSizeKW * 1000)).toFixed(2));
    
    // Initialize financial tracking variables
    let totalSavings = 0;
    let yearlyProduction = annualProduction;
    let currentElectricityRate = electricityRate;
    let yearToBreakEven = 0;
    let cumulativeCashFlow = -netCost;
    let firstYearSavings = 0;
    
    // Calculate first year savings
    firstYearSavings = annualProduction * electricityRate;
    
    // Calculate savings over 25 years with degradation and electricity inflation
    const yearlyCashFlows = [];
    
    for (let year = 1; year <= 25; year++) {
      // Apply annual degradation to production
      if (year > 1) {
        yearlyProduction = yearlyProduction * (1 - annualDegradation / 100);
      }
      
      // Apply electricity price inflation
      if (year > 1) {
        currentElectricityRate = currentElectricityRate * (1 + electricityInflation / 100);
      }
      
      // Calculate yearly savings
      const yearlySavings = yearlyProduction * currentElectricityRate;
      totalSavings += yearlySavings;
      
      // Track cumulative cash flow
      cumulativeCashFlow += yearlySavings;
      
      // Store yearly cash flow for later calculations
      yearlyCashFlows.push({
        year,
        production: yearlyProduction,
        electricityRate: currentElectricityRate,
        savings: yearlySavings,
        cumulativeCashFlow
      });
      
      // Check for breakeven if not already found
      if (cumulativeCashFlow >= 0 && yearToBreakEven === 0) {
        const previousYear = year - 1;
        const previousCashFlow = previousYear > 0 ? yearlyCashFlows[previousYear - 1].cumulativeCashFlow : -netCost;
        // Calculate more precise breakeven using linear interpolation
        const fractionOfYear = Math.abs(previousCashFlow) / (Math.abs(previousCashFlow) + cumulativeCashFlow);
        yearToBreakEven = previousYear + fractionOfYear;
      }
    }
    
    // Calculate ROI (Return on Investment)
    const roi = parseFloat(((totalSavings - netCost) / netCost * 100).toFixed(2));
    
    // Calculate IRR (Internal Rate of Return)
    const irr = calculateIRR([-netCost, ...yearlyCashFlows.map(y => y.savings)]);
    
    // Calculate NPV (Net Present Value) with 5% discount rate
    const npv = calculateNPV([-netCost, ...yearlyCashFlows.map(y => y.savings)], 0.05);
    
    // Calculate LCOE (Levelized Cost of Energy)
    const totalLifetimeProduction = yearlyCashFlows.reduce((sum, y) => sum + y.production, 0);
    const lcoe = parseFloat((netCost / totalLifetimeProduction).toFixed(3));
    
    // If financing is specified, calculate monthly payment
    let monthlyPayment = 0;
    if (financingYears > 0 && interestRate > 0) {
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = financingYears * 12;
      monthlyPayment = 
        (netCost * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }
    
    return {
      netCost: Math.round(netCost),
      costPerWatt,
      firstYearSavings: Math.round(firstYearSavings),
      paybackPeriod: parseFloat(yearToBreakEven.toFixed(1)),
      totalSavings: Math.round(totalSavings),
      roi,
      irr: parseFloat((irr * 100).toFixed(2)),
      npv: Math.round(npv),
      lcoe,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      yearlyCashFlows: yearlyCashFlows.map(y => ({
        year: y.year,
        savings: Math.round(y.savings),
        cumulativeCashFlow: Math.round(y.cumulativeCashFlow)
      }))
    };
  } catch (error) {
    console.error('Error in calculateFinancials:', error);
    throw new Error(`Financial calculation failed: ${error.message}`);
  }
};

/**
 * Calculate environmental impact of solar system
 * @param {Object} params
 * @param {Number} params.annualProduction - Annual energy production in kWh
 * @param {String} params.region - Geographic region for emissions calculations
 * @returns {Object} Environmental impact calculation results
 */
const calculateEnvironmentalImpact = (params) => {
  const {
    annualProduction = 14000,
    region = 'US'
  } = params;
  
  try {
    // Regional CO2 emission factors (kg CO2/kWh)
    const emissionFactors = {
      'US': 0.417,
      'EU': 0.275,
      'China': 0.623,
      'India': 0.708,
      'Australia': 0.527,
      'Canada': 0.126,
      'UK': 0.233,
      'Japan': 0.474
    };
    
    // Use US as default if region not found
    const emissionFactor = emissionFactors[region] || emissionFactors['US'];
    
    // Calculate CO2 reduction
    const annualCO2Reduction = annualProduction * emissionFactor;
    const twentyFiveYearCO2Reduction = annualCO2Reduction * 25;
    
    // Environmental equivalents
    // Trees absorb ~21.7 kg CO2 per year
    const treesPlanted = Math.round(annualCO2Reduction / 21.7);
    
    // Average car emits ~4.6 metric tons CO2 per year
    const carsRemoved = Math.round(annualCO2Reduction / 4600);
    
    // 1 gallon of gasoline = ~8.887 kg CO2
    const gasConsumedGallons = Math.round(annualCO2Reduction / 8.887);
    
    // Average US home uses ~10,600 kWh/year
    const homesPowered = Math.round(annualProduction / 10600);
    
    return {
      annualCO2Reduction: Math.round(annualCO2Reduction),
      twentyFiveYearCO2Reduction: Math.round(twentyFiveYearCO2Reduction),
      equivalents: {
        treesPlanted,
        carsRemoved,
        gasConsumedGallons,
        homesPowered,
        carMilesDriven: Math.round(gasConsumedGallons * 22) // ~22 miles per gallon
      }
    };
  } catch (error) {
    console.error('Error in calculateEnvironmentalImpact:', error);
    throw new Error(`Environmental impact calculation failed: ${error.message}`);
  }
};

/**
 * Estimate monthly energy production based on system size and location
 * @param {Object} params
 * @param {Number} params.systemSizeKW - System size in kW
 * @param {Object} params.location - Location data
 * @param {Number} params.tilt - Panel tilt angle in degrees
 * @param {Number} params.azimuth - Panel azimuth angle in degrees (180 = South)
 * @param {Number} params.systemLosses - System losses percentage (0-100)
 * @returns {Object} Monthly production estimates
 */
const estimateMonthlyProduction = (params) => {
  const {
    systemSizeKW = 10,
    location = { climateZone: 'temperate', latitude: 40 },
    tilt = 30,
    azimuth = 180,
    systemLosses = 14
  } = params;
  
  try {
    // Climate zone monthly insolation factors
    const monthlyFactors = {
      'tropical': [0.09, 0.085, 0.085, 0.08, 0.08, 0.075, 0.075, 0.08, 0.08, 0.085, 0.085, 0.09],
      'desert': [0.07, 0.075, 0.085, 0.09, 0.095, 0.10, 0.10, 0.095, 0.09, 0.085, 0.075, 0.07],
      'temperate': [0.055, 0.065, 0.08, 0.095, 0.105, 0.11, 0.11, 0.105, 0.095, 0.08, 0.065, 0.055],
      'continental': [0.045, 0.06, 0.08, 0.10, 0.11, 0.12, 0.12, 0.11, 0.10, 0.08, 0.06, 0.045],
      'polar': [0.02, 0.045, 0.07, 0.10, 0.13, 0.15, 0.15, 0.13, 0.10, 0.07, 0.045, 0.02]
    };
    
    // Get factors for climate zone or default to temperate
    const factors = monthlyFactors[location.climateZone] || monthlyFactors.temperate;
    
    // Calculate annual production
    const annualProduction = systemSizeKW * 365 * 5 * (1 - systemLosses / 100); // Using 5 sun hours as baseline

    // Apply tilt and orientation losses
    // Optimal tilt is approximately equal to latitude
    const latitude = location.latitude || 40;
    const optimalTilt = latitude;
    const tiltLoss = Math.abs(tilt - optimalTilt) * 0.2; // 0.2% loss per degree away from optimal
    
    // Optimal azimuth is 180 degrees (south) in northern hemisphere
    const azimuthLoss = Math.abs(azimuth - 180) * 0.15 / 90; // Linear loss up to 15% at east/west
    
    // Apply geographical and seasonal adjustments
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      // Calculate sun declination for the middle of the month
      const dayOfYear = Math.floor(DAYS_IN_MONTH.slice(0, month).reduce((sum, days) => sum + days, 0) + DAYS_IN_MONTH[month] / 2);
      const declination = EARTH_TILT * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
      
      // Calculate adjustment factor for the specific month based on panel tilt and sun declination
      const tiltEfficiency = Math.cos(Math.abs(tilt - (latitude - declination)) * Math.PI / 180);
      const seasonalTiltFactor = 0.85 + (0.15 * tiltEfficiency);
      
      // Calculate production for this month
      const baseFactor = factors[month];
      const adjustedFactor = baseFactor * seasonalTiltFactor * (1 - tiltLoss / 100) * (1 - azimuthLoss);
      const monthlyProduction = Math.round(annualProduction * adjustedFactor);
      
      // Month names
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      
      monthlyData.push({
        month: monthNames[month],
        productionKWh: monthlyProduction,
        sunHours: tiltEfficiency * 5 // approximate sun hours
      });
    }
    
    // Calculate total production
    const totalCalculatedProduction = monthlyData.reduce((sum, month) => sum + month.productionKWh, 0);
    
    // Normalize to make sure monthly sum equals annual production
    const normalizationFactor = annualProduction / totalCalculatedProduction;
    monthlyData.forEach(month => {
      month.productionKWh = Math.round(month.productionKWh * normalizationFactor);
    });
    
    return {
      monthlyProduction: monthlyData,
      annualProduction: Math.round(annualProduction),
      tiltLossPercent: parseFloat(tiltLoss.toFixed(1)),
      azimuthLossPercent: parseFloat((azimuthLoss * 100).toFixed(1)),
      systemSizeKW: parseFloat(systemSizeKW.toFixed(2))
    };
  } catch (error) {
    console.error('Error in estimateMonthlyProduction:', error);
    throw new Error(`Monthly production estimation failed: ${error.message}`);
  }
};

/**
 * Calculate Internal Rate of Return (IRR)
 * @param {Array} cashFlows - Array of cash flows starting with initial investment (negative)
 * @returns {Number} IRR as a decimal
 */
const calculateIRR = (cashFlows) => {
  const maxIterations = 1000;
  const tolerance = 0.0000001;
  
  let guess = 0.1; // Initial guess at 10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = cashFlows[0]; // Initial investment
    let derivative = 0;
    
    // Calculate NPV and its derivative at current guess
    for (let t = 1; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + guess, -t);
      npv += cashFlows[t] * discountFactor;
      derivative -= t * cashFlows[t] * Math.pow(1 + guess, -t - 1);
    }
    
    // Break if NPV is close enough to zero
    if (Math.abs(npv) < tolerance) {
      return guess;
    }
    
    // Use Newton-Raphson method to improve guess
    const newGuess = guess - npv / derivative;
    
    // Break if improvement is minimal
    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess;
    }
    
    guess = newGuess;
  }
  
  // If no convergence, return best guess
  return guess;
};

/**
 * Calculate Net Present Value (NPV)
 * @param {Array} cashFlows - Array of cash flows starting with initial investment (negative)
 * @param {Number} discountRate - Discount rate as a decimal (e.g., 0.05 for 5%)
 * @returns {Number} NPV
 */
const calculateNPV = (cashFlows, discountRate) => {
  return cashFlows.reduce((npv, cashFlow, index) => {
    return npv + cashFlow / Math.pow(1 + discountRate, index);
  }, 0);
};

module.exports = {
  calculateSystemSize,
  calculateFinancials,
  calculateEnvironmentalImpact,
  estimateMonthlyProduction
};