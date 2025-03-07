/**
 * Solar Calculator Controller
 * 
 * Handles API endpoints for solar system calculations and estimates.
 */
const { 
  calculateSystemSize, 
  calculateFinancials, 
  calculateMonthlyProduction,
  calculateOffset,
  calculateEmissionsReduction
} = require('../utils/solarCalculator');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorMiddleware');
const cacheManager = require('../utils/cacheManager');

/**
 * @desc    Calculate system size based on energy usage
 * @route   POST /api/solar-calculator/system-size
 * @access  Private
 */
const getSystemSize = async (req, res, next) => {
  try {
    const { monthlyUsage, offsetPercentage, sunHoursPerDay, systemLosses } = req.body;
    
    logger.debug('Solar system size calculation request', { 
      monthlyUsage, 
      offsetPercentage, 
      sunHoursPerDay 
    });
    
    // Validate required fields
    if (!monthlyUsage || !sunHoursPerDay) {
      throw ApiError.badRequest('Monthly usage and sun hours per day are required');
    }
    
    // Calculate system size
    const result = calculateSystemSize({
      monthlyUsage,
      offsetPercentage,
      sunHoursPerDay, 
      systemLosses
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate financial metrics
 * @route   POST /api/solar-calculator/financials
 * @access  Private
 */
const getFinancials = async (req, res, next) => {
  try {
    const { 
      systemSizeKW, 
      installationCost, 
      electricityRate, 
      annualProduction,
      annualDegradation,
      electricityInflation,
      incentives,
      financingYears,
      interestRate
    } = req.body;
    
    logger.debug('Solar financials calculation request', { 
      systemSizeKW, 
      installationCost, 
      electricityRate 
    });
    
    // Validate required fields
    if (!systemSizeKW || !installationCost || !electricityRate || !annualProduction) {
      throw ApiError.badRequest('System size, installation cost, electricity rate, and annual production are required');
    }
    
    // Calculate financials
    const result = calculateFinancials({
      systemSizeKW,
      installationCost,
      electricityRate,
      annualProduction,
      annualDegradation,
      electricityInflation,
      incentives,
      financingYears,
      interestRate
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate monthly production
 * @route   POST /api/solar-calculator/production
 * @access  Private
 */
const getMonthlyProduction = async (req, res, next) => {
  try {
    const { systemSizeKW, location, tilt, azimuth, systemLosses } = req.body;
    
    logger.debug('Monthly production calculation request', { 
      systemSizeKW, 
      location, 
      tilt, 
      azimuth 
    });
    
    // Validate required fields
    if (!systemSizeKW || !location) {
      throw ApiError.badRequest('System size and location are required');
    }
    
    // Check if we have cached result
    const cacheKey = cacheManager.createKey('solar:production', {
      systemSizeKW, 
      location: JSON.stringify(location), 
      tilt, 
      azimuth, 
      systemLosses
    });
    
    // Try to get from cache
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }
    
    // Calculate monthly production
    const result = calculateMonthlyProduction({
      systemSizeKW,
      location,
      tilt,
      azimuth,
      systemLosses
    });
    
    // Cache the result
    cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate energy offset
 * @route   POST /api/solar-calculator/offset
 * @access  Private
 */
const getEnergyOffset = async (req, res, next) => {
  try {
    const { annualProduction, annualConsumption } = req.body;
    
    logger.debug('Energy offset calculation request', { 
      annualProduction, 
      annualConsumption 
    });
    
    // Validate required fields
    if (!annualProduction || !annualConsumption) {
      throw ApiError.badRequest('Annual production and annual consumption are required');
    }
    
    // Calculate offset
    const result = calculateOffset({
      annualProduction,
      annualConsumption
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate emissions reduction
 * @route   POST /api/solar-calculator/emissions
 * @access  Private
 */
const getEmissionsReduction = async (req, res, next) => {
  try {
    const { annualProduction, emissionsFactor, region } = req.body;
    
    logger.debug('Emissions reduction calculation request', { 
      annualProduction, 
      region 
    });
    
    // Validate required fields
    if (!annualProduction) {
      throw ApiError.badRequest('Annual production is required');
    }
    
    // Calculate emissions reduction
    const result = calculateEmissionsReduction({
      annualProduction,
      emissionsFactor,
      region
    });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get equipment options
 * @route   GET /api/solar-calculator/equipment/:type
 * @access  Private
 */
const getEquipment = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    logger.debug('Equipment options request', { type });
    
    // Validate equipment type
    const allowedTypes = ['panels', 'inverters', 'batteries', 'racking'];
    if (!allowedTypes.includes(type)) {
      throw ApiError.badRequest('Invalid equipment type. Must be one of: panels, inverters, batteries, racking');
    }
    
    // Check if we have cached result
    const cacheKey = `solar:equipment:${type}`;
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }
    
    // Sample equipment data - in a real system this would come from a database
    const equipmentData = {
      panels: [
        { id: 'p1', manufacturer: 'SunPower', model: 'Maxeon 5', wattage: 400, efficiency: 22.6, warranty: 25, price: 450 },
        { id: 'p2', manufacturer: 'LG', model: 'NeON R', wattage: 380, efficiency: 21.7, warranty: 25, price: 420 },
        { id: 'p3', manufacturer: 'Canadian Solar', model: 'HiKu', wattage: 370, efficiency: 20.9, warranty: 25, price: 380 },
        { id: 'p4', manufacturer: 'JinkoSolar', model: 'Tiger Pro', wattage: 390, efficiency: 21.3, warranty: 25, price: 400 },
        { id: 'p5', manufacturer: 'Panasonic', model: 'EverVolt', wattage: 360, efficiency: 21.2, warranty: 25, price: 390 }
      ],
      inverters: [
        { id: 'i1', manufacturer: 'SolarEdge', model: 'HD-Wave', power: 5000, efficiency: 99.0, warranty: 12, price: 1800 },
        { id: 'i2', manufacturer: 'Enphase', model: 'IQ8+', power: 290, efficiency: 97.5, warranty: 10, price: 180, type: 'microinverter' },
        { id: 'i3', manufacturer: 'SMA', model: 'Sunny Boy', power: 6000, efficiency: 97.6, warranty: 10, price: 2100 },
        { id: 'i4', manufacturer: 'Fronius', model: 'Primo', power: 5000, efficiency: 98.1, warranty: 10, price: 1950 },
        { id: 'i5', manufacturer: 'ABB', model: 'UNO-DM-Plus', power: 4600, efficiency: 97.0, warranty: 10, price: 1700 }
      ],
      batteries: [
        { id: 'b1', manufacturer: 'Tesla', model: 'Powerwall 2', capacity: 13.5, power: 5, warranty: 10, price: 7500 },
        { id: 'b2', manufacturer: 'LG Chem', model: 'RESU10H', capacity: 9.8, power: 5, warranty: 10, price: 5900 },
        { id: 'b3', manufacturer: 'Enphase', model: 'Encharge 10', capacity: 10.5, power: 3.84, warranty: 10, price: 6000 },
        { id: 'b4', manufacturer: 'Generac', model: 'PWRcell', capacity: 9, power: 4.5, warranty: 10, price: 5500 },
        { id: 'b5', manufacturer: 'SunPower', model: 'SunVault', capacity: 13, power: 6.8, warranty: 10, price: 7200 }
      ],
      racking: [
        { id: 'r1', manufacturer: 'IronRidge', model: 'XR100', type: 'roof mount', warranty: 20, price: 15 },
        { id: 'r2', manufacturer: 'SnapNrack', model: 'Series 100', type: 'roof mount', warranty: 20, price: 14 },
        { id: 'r3', manufacturer: 'Unirac', model: 'SolarMount', type: 'roof mount', warranty: 25, price: 16 },
        { id: 'r4', manufacturer: 'QuickMount PV', model: 'QRail', type: 'roof mount', warranty: 20, price: 15 },
        { id: 'r5', manufacturer: 'RBI Solar', model: 'Ground Mount', type: 'ground mount', warranty: 20, price: 70 }
      ]
    };
    
    const result = {
      type,
      equipment: equipmentData[type] || []
    };
    
    // Cache the result
    cacheManager.set(cacheKey, result, 86400); // Cache for 24 hours
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemSize,
  getFinancials,
  getMonthlyProduction,
  getEnergyOffset,
  getEmissionsReduction,
  getEquipment
};