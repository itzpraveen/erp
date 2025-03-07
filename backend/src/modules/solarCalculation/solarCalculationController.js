const SolarCalculation = require('./solarCalculationModel');
const solarService = require('./solarCalculationService');
const Lead = require('../../models/Lead');
const User = require('../../models/User');
const mongoose = require('mongoose');
const { ApiError } = require('../../middleware/errorMiddleware');

/**
 * @desc    Calculate system size
 * @route   POST /api/solar-calculator/system-size
 * @access  Private
 */
const calculateSystemSize = async (req, res) => {
  try {
    const {
      monthlyUsage,
      offsetPercentage,
      sunHoursPerDay,
      systemLosses,
      leadId,
      location,
      panelId
    } = req.body;

    // Input validation
    if (!monthlyUsage || monthlyUsage <= 0) {
      throw new ApiError(400, 'Monthly usage must be greater than zero');
    }

    if (offsetPercentage <= 0 || offsetPercentage > 200) {
      throw new ApiError(400, 'Offset percentage must be between 1% and 200%');
    }

    if (sunHoursPerDay <= 0 || sunHoursPerDay > 12) {
      throw new ApiError(400, 'Sun hours per day must be between 0 and 12');
    }

    // Get panel data if panelId is provided
    let panelData = { wattage: 400, efficiency: 20 }; // Default panel
    
    if (panelId) {
      // In a real implementation, fetch the panel data from the database
      // For now, simulate with a basic set of panel options
      const panels = [
        { id: 'mono400', wattage: 400, efficiency: 21.5, dimensions: { length: 1.7, width: 1.0 } },
        { id: 'poly350', wattage: 350, efficiency: 19.5, dimensions: { length: 1.65, width: 0.99 } },
        { id: 'premium450', wattage: 450, efficiency: 22.8, dimensions: { length: 1.75, width: 1.05 } },
      ];
      
      const selectedPanel = panels.find(p => p.id === panelId);
      if (selectedPanel) {
        panelData = selectedPanel;
      }
    }
    
    // Calculate system size
    const calculationResult = solarService.calculateSystemSize({
      monthlyUsage,
      offsetPercentage,
      sunHoursPerDay,
      systemLosses: systemLosses || 14,
      panelData
    });
    
    // If leadId is provided, store the calculation in the database
    if (leadId && mongoose.Types.ObjectId.isValid(leadId)) {
      try {
        // Verify the lead exists
        const lead = await Lead.findById(leadId).select('_id name email');
        
        if (lead) {
          // Create location object
          let locationData = {};
          if (location) {
            locationData = {
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
              city: location.city,
              state: location.state,
              zipCode: location.zipCode,
              country: location.country || 'USA',
              climateZone: location.climateZone || 'temperate'
            };
          }
          
          // Create a new solar calculation record
          const solarCalculation = new SolarCalculation({
            userId: req.user._id,
            leadId: lead._id,
            location: locationData,
            electricityUsage: {
              averageMonthly: monthlyUsage,
              annual: monthlyUsage * 12,
              rate: req.body.electricityRate || 0.15
            },
            systemParameters: {
              offsetPercentage,
              panelType: panelData.id || 'standard',
              panelWattage: panelData.wattage,
              panelEfficiency: panelData.efficiency,
              systemLosses: systemLosses || 14,
              includeStorage: req.body.includeStorage || false,
              storageCapacity: req.body.storageCapacity || 0
            },
            calculationResults: {
              systemSizeKw: calculationResult.systemSizeKW,
              numberOfPanels: calculationResult.numberOfPanels,
              annualProduction: calculationResult.annualProduction,
              monthlyProduction: calculationResult.monthlyProduction || Array(12).fill(0),
              roofSpaceRequired: calculationResult.roofSpaceRequired
            }
          });
          
          await solarCalculation.save();
          calculationResult.calculationId = solarCalculation._id;
        }
      } catch (err) {
        console.error('Error saving calculation to database:', err);
        // Continue with the response even if saving fails
      }
    }
    
    res.json(calculationResult);
  } catch (error) {
    console.error('Error in calculateSystemSize controller:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error calculating system size',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Calculate financial metrics
 * @route   POST /api/solar-calculator/financials
 * @access  Private
 */
const calculateFinancials = async (req, res) => {
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
      interestRate,
      calculationId
    } = req.body;

    // Input validation
    if (!systemSizeKW || systemSizeKW <= 0) {
      throw new ApiError(400, 'System size must be greater than zero');
    }

    if (!installationCost || installationCost <= 0) {
      throw new ApiError(400, 'Installation cost must be greater than zero');
    }

    if (!electricityRate || electricityRate <= 0) {
      throw new ApiError(400, 'Electricity rate must be greater than zero');
    }

    if (!annualProduction || annualProduction <= 0) {
      throw new ApiError(400, 'Annual production must be greater than zero');
    }
    
    // Calculate financials
    const financialsResult = solarService.calculateFinancials({
      systemSizeKW,
      installationCost,
      electricityRate,
      annualProduction,
      annualDegradation: annualDegradation || 0.5,
      electricityInflation: electricityInflation || 3.0,
      incentives: incentives || 0,
      financingYears: financingYears || 0,
      interestRate: interestRate || 4.5
    });
    
    // If calculationId is provided, update the record in the database
    if (calculationId && mongoose.Types.ObjectId.isValid(calculationId)) {
      try {
        const solarCalculation = await SolarCalculation.findById(calculationId);
        
        if (solarCalculation && solarCalculation.userId.toString() === req.user._id.toString()) {
          // Update financial results
          solarCalculation.financialResults = {
            initialInvestment: installationCost,
            incentives: [{
              name: 'Federal Tax Credit',
              type: 'federal',
              amount: incentives || 0,
              percentage: 0
            }],
            netSystemCost: financialsResult.netCost,
            costPerWatt: financialsResult.costPerWatt,
            monthlyBillSavings: financialsResult.firstYearSavings / 12,
            annualSavings: financialsResult.firstYearSavings,
            paybackPeriod: financialsResult.paybackPeriod,
            roi: financialsResult.roi,
            irr: financialsResult.irr,
            npv: financialsResult.npv,
            lcoe: financialsResult.lcoe,
            twentyFiveYearSavings: financialsResult.totalSavings,
            financingOption: financingYears > 0 ? 'loan' : 'cash',
            financingTermYears: financingYears || 0,
            interestRate: interestRate || 0,
            monthlyFinancingPayment: financialsResult.monthlyPayment || 0
          };
          
          solarCalculation.electricityUsage.rate = electricityRate;
          solarCalculation.dateLastModified = new Date();
          
          await solarCalculation.save();
        }
      } catch (err) {
        console.error('Error updating calculation with financials:', err);
        // Continue with the response even if saving fails
      }
    }
    
    res.json(financialsResult);
  } catch (error) {
    console.error('Error in calculateFinancials controller:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error calculating financial metrics',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Calculate environmental impact
 * @route   POST /api/solar-calculator/environmental-impact
 * @access  Private
 */
const calculateEnvironmentalImpact = async (req, res) => {
  try {
    const { annualProduction, region, calculationId } = req.body;

    // Input validation
    if (!annualProduction || annualProduction <= 0) {
      throw new ApiError(400, 'Annual production must be greater than zero');
    }
    
    // Calculate environmental impact
    const impactResult = solarService.calculateEnvironmentalImpact({
      annualProduction,
      region: region || 'US'
    });
    
    // If calculationId is provided, update the record in the database
    if (calculationId && mongoose.Types.ObjectId.isValid(calculationId)) {
      try {
        const solarCalculation = await SolarCalculation.findById(calculationId);
        
        if (solarCalculation && solarCalculation.userId.toString() === req.user._id.toString()) {
          // Update environmental impact
          solarCalculation.environmentalImpact = {
            annualCO2Reduction: impactResult.annualCO2Reduction,
            lifetimeCO2Reduction: impactResult.twentyFiveYearCO2Reduction,
            treesPlantedEquivalent: impactResult.equivalents.treesPlanted,
            carsRemovedEquivalent: impactResult.equivalents.carsRemoved,
            gasGallonsSavedEquivalent: impactResult.equivalents.gasConsumedGallons,
            homesPoweredEquivalent: impactResult.equivalents.homesPowered
          };
          
          solarCalculation.dateLastModified = new Date();
          
          await solarCalculation.save();
        }
      } catch (err) {
        console.error('Error updating calculation with environmental impact:', err);
        // Continue with the response even if saving fails
      }
    }
    
    res.json(impactResult);
  } catch (error) {
    console.error('Error in calculateEnvironmentalImpact controller:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error calculating environmental impact',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Estimate monthly production
 * @route   POST /api/solar-calculator/monthly-production
 * @access  Private
 */
const estimateMonthlyProduction = async (req, res) => {
  try {
    const {
      systemSizeKW,
      location,
      tilt,
      azimuth,
      systemLosses,
      calculationId
    } = req.body;

    // Input validation
    if (!systemSizeKW || systemSizeKW <= 0) {
      throw new ApiError(400, 'System size must be greater than zero');
    }
    
    // Estimate monthly production
    const productionResult = solarService.estimateMonthlyProduction({
      systemSizeKW,
      location: location || { climateZone: 'temperate', latitude: 40 },
      tilt: tilt || 30,
      azimuth: azimuth || 180,
      systemLosses: systemLosses || 14
    });
    
    // If calculationId is provided, update the record in the database
    if (calculationId && mongoose.Types.ObjectId.isValid(calculationId)) {
      try {
        const solarCalculation = await SolarCalculation.findById(calculationId);
        
        if (solarCalculation && solarCalculation.userId.toString() === req.user._id.toString()) {
          // Update monthly production
          solarCalculation.calculationResults.monthlyProduction = 
            productionResult.monthlyProduction.map(month => month.productionKWh);
          
          // Update shading data
          solarCalculation.shading = {
            annualShadingLoss: 0, // Not provided in this calculation
            monthlyShadingLoss: Array(12).fill(0), // Not provided in this calculation
            annualTiltLoss: productionResult.tiltLossPercent,
            annualOrientationLoss: productionResult.azimuthLossPercent
          };
          
          solarCalculation.dateLastModified = new Date();
          
          await solarCalculation.save();
        }
      } catch (err) {
        console.error('Error updating calculation with monthly production:', err);
        // Continue with the response even if saving fails
      }
    }
    
    res.json(productionResult);
  } catch (error) {
    console.error('Error in estimateMonthlyProduction controller:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error estimating monthly production',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Save calculation to user's saved calculations
 * @route   POST /api/solar-calculator/save
 * @access  Private
 */
const saveCalculation = async (req, res) => {
  try {
    const { calculationId, name } = req.body;

    if (!calculationId || !mongoose.Types.ObjectId.isValid(calculationId)) {
      throw new ApiError(400, 'Valid calculation ID is required');
    }
    
    const calculation = await SolarCalculation.findById(calculationId);
    
    if (!calculation) {
      throw new ApiError(404, 'Calculation not found');
    }
    
    if (calculation.userId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to save this calculation');
    }
    
    // Update the calculation
    calculation.savedByUser = true;
    calculation.calculationMetadata = {
      ...calculation.calculationMetadata || {},
      name: name || `Calculation ${new Date().toLocaleString()}`,
      savedAt: new Date()
    };
    
    await calculation.save();
    
    res.json({ 
      message: 'Calculation saved successfully',
      calculationId: calculation._id
    });
  } catch (error) {
    console.error('Error saving calculation:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error saving calculation',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Get available equipment options
 * @route   GET /api/solar-calculator/equipment/:type
 * @access  Private
 */
const getAvailableEquipment = async (req, res) => {
  try {
    const { type } = req.params;
    
    // In a real implementation, fetch equipment data from the database
    // For now, simulate with static data
    
    let equipment = [];
    
    switch (type) {
      case 'panels':
        equipment = [
          {
            id: 'mono400',
            manufacturer: 'SunPower',
            model: 'Maxeon 3',
            wattage: 400,
            efficiency: 21.5,
            type: 'monocrystalline',
            dimensions: { length: 1.7, width: 1.0 },
            warranty: 25,
            price: 1.20 // $ per watt
          },
          {
            id: 'poly350',
            manufacturer: 'Canadian Solar',
            model: 'CS3K-350',
            wattage: 350,
            efficiency: 19.5,
            type: 'polycrystalline',
            dimensions: { length: 1.65, width: 0.99 },
            warranty: 25,
            price: 0.85 // $ per watt
          },
          {
            id: 'premium450',
            manufacturer: 'LG',
            model: 'NeON R',
            wattage: 450,
            efficiency: 22.8,
            type: 'monocrystalline',
            dimensions: { length: 1.75, width: 1.05 },
            warranty: 25,
            price: 1.40 // $ per watt
          },
          {
            id: 'budget320',
            manufacturer: 'Jinko Solar',
            model: 'Eagle 320',
            wattage: 320,
            efficiency: 18.5,
            type: 'polycrystalline',
            dimensions: { length: 1.63, width: 0.98 },
            warranty: 20,
            price: 0.70 // $ per watt
          }
        ];
        break;
        
      case 'inverters':
        equipment = [
          {
            id: 'string5kw',
            manufacturer: 'SMA',
            model: 'Sunny Boy 5.0',
            type: 'string',
            power: 5000, // Watts
            efficiency: 97.2,
            warranty: 10,
            price: 0.25 // $ per watt
          },
          {
            id: 'micro250',
            manufacturer: 'Enphase',
            model: 'IQ7+',
            type: 'microinverter',
            power: 250, // Watts per microinverter
            efficiency: 97.5,
            warranty: 12,
            price: 0.40 // $ per watt
          },
          {
            id: 'hybrid8kw',
            manufacturer: 'SolarEdge',
            model: 'StorEdge 8000H',
            type: 'hybrid',
            power: 8000, // Watts
            efficiency: 97.0,
            batteryCompatible: true,
            warranty: 12,
            price: 0.35 // $ per watt
          }
        ];
        break;
        
      case 'batteries':
        equipment = [
          {
            id: 'lithium10',
            manufacturer: 'Tesla',
            model: 'Powerwall 2',
            type: 'lithium-ion',
            capacity: 13.5, // kWh
            power: 5.0, // kW
            roundTripEfficiency: 90,
            warranty: 10,
            warrantyCycles: 3000,
            price: 8500 // $
          },
          {
            id: 'lithium16',
            manufacturer: 'LG Chem',
            model: 'RESU16H',
            type: 'lithium-ion',
            capacity: 16.0, // kWh
            power: 7.0, // kW
            roundTripEfficiency: 94.5,
            warranty: 10,
            warrantyCycles: 3500,
            price: 9200 // $
          },
          {
            id: 'saltwater40',
            manufacturer: 'Aquion',
            model: 'Aspen 40',
            type: 'saltwater',
            capacity: 40.0, // kWh
            power: 10.0, // kW
            roundTripEfficiency: 85,
            warranty: 8,
            warrantyCycles: 3000,
            price: 18000 // $
          }
        ];
        break;
        
      default:
        throw new ApiError(400, 'Invalid equipment type. Available types: panels, inverters, batteries');
    }
    
    res.json({ 
      equipment,
      type
    });
  } catch (error) {
    console.error('Error getting available equipment:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error fetching equipment data',
        error: error.message 
      });
    }
  }
};

/**
 * @desc    Get user's saved calculations
 * @route   GET /api/solar-calculator/saved
 * @access  Private
 */
const getSavedCalculations = async (req, res) => {
  try {
    const calculations = await SolarCalculation
      .find({ userId: req.user._id, savedByUser: true })
      .select('_id calculationMetadata location calculationResults financialResults environmentalImpact leadId createdAt updatedAt')
      .populate('leadId', 'name email phone address')
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json(calculations);
  } catch (error) {
    console.error('Error getting saved calculations:', error);
    res.status(500).json({ 
      message: 'Error fetching saved calculations',
      error: error.message 
    });
  }
};

/**
 * @desc    Get calculation by ID
 * @route   GET /api/solar-calculator/:id
 * @access  Private
 */
const getCalculationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid calculation ID format');
    }
    
    const calculation = await SolarCalculation
      .findById(id)
      .populate('leadId', 'name email phone address')
      .populate('userId', 'name email')
      .lean();
    
    if (!calculation) {
      throw new ApiError(404, 'Calculation not found');
    }
    
    // Check if user is authorized to view this calculation
    if (calculation.userId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && req.user.role !== 'manager') {
      throw new ApiError(403, 'Not authorized to view this calculation');
    }
    
    res.json(calculation);
  } catch (error) {
    console.error('Error getting calculation by ID:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ 
        message: 'Error fetching calculation',
        error: error.message 
      });
    }
  }
};

module.exports = {
  calculateSystemSize,
  calculateFinancials,
  calculateEnvironmentalImpact,
  estimateMonthlyProduction,
  saveCalculation,
  getAvailableEquipment,
  getSavedCalculations,
  getCalculationById
};