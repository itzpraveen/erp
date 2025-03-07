const mongoose = require('mongoose');

/**
 * Enhanced Solar Calculation Model
 * Stores calculation parameters and results for better accuracy and historical tracking
 */
const SolarCalculationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: false
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      timezone: String,
      climateZone: String
    },
    electricityUsage: {
      annual: Number,
      monthly: [Number],  // 12 months of usage data
      averageMonthly: Number,
      peakDemand: Number,
      rate: Number,       // $ per kWh
      utilityCompany: String,
      rateStructure: String  // e.g., "tiered", "time-of-use", "flat"
    },
    roofParameters: {
      availableArea: Number,  // square meters
      orientation: Number,    // degrees (0-359, 180 = South)
      tilt: Number,           // degrees (0-90, 0 = flat)
      shading: Number,        // percentage (0-100)
      roofType: String,       // e.g., "asphalt", "metal", "tile"
      structuralCapacity: String
    },
    systemParameters: {
      offsetPercentage: Number,    // percentage (0-200)
      panelType: String,           // e.g., "monocrystalline", "polycrystalline"
      panelWattage: Number,        // watts
      panelEfficiency: Number,     // percentage
      inverterType: String,        // e.g., "string", "microinverter", "optimizer"
      dcToAcRatio: Number,         // typically 1.1 to 1.3
      systemLosses: Number,        // percentage
      includeStorage: Boolean,
      storageCapacity: Number,     // kWh
      includedBackup: Boolean
    },
    calculationResults: {
      systemSizeKw: Number,
      numberOfPanels: Number,
      annualProduction: Number,    // kWh
      monthlyProduction: [Number], // 12 months
      performanceRatio: Number,    // percentage
      specificYield: Number,       // kWh/kWp
      capacityFactor: Number,      // percentage
      roofSpaceRequired: Number    // square meters
    },
    financialResults: {
      initialInvestment: Number,
      incentives: [
        {
          name: String,
          type: String,  // e.g., "federal", "state", "utility", "other"
          amount: Number,
          percentage: Number
        }
      ],
      netSystemCost: Number,
      costPerWatt: Number,
      monthlyBillSavings: Number,
      annualSavings: Number,
      paybackPeriod: Number,
      roi: Number,               // percentage
      irr: Number,               // percentage
      npv: Number,
      lcoe: Number,              // Levelized Cost of Energy ($/kWh)
      twentyFiveYearSavings: Number,
      financingOption: String,   // e.g., "cash", "loan", "lease", "ppa"
      financingTermYears: Number,
      interestRate: Number,
      monthlyFinancingPayment: Number
    },
    environmentalImpact: {
      annualCO2Reduction: Number,  // kg
      lifetimeCO2Reduction: Number, // kg
      treesPlantedEquivalent: Number,
      carsRemovedEquivalent: Number,
      gasGallonsSavedEquivalent: Number,
      homesPoweredEquivalent: Number
    },
    shading: {
      annualShadingLoss: Number,
      monthlyShadingLoss: [Number], // 12 months
      annualTiltLoss: Number, 
      annualOrientationLoss: Number
    },
    hourlySimulation: {
      performed: {
        type: Boolean,
        default: false
      },
      hourlyDataSummary: {
        peakProduction: Number,
        averageProduction: Number,
        standardDeviation: Number
      }
    },
    calculationMetadata: {
      version: String,
      calculationEngine: String,
      weatherDataSource: String,
      dataYear: Number,
      temperatureCoefficient: Number,
      annualDegradation: Number,
      moduleModel: String,
      inverterModel: String
    },
    savedByUser: {
      type: Boolean,
      default: false
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    },
    dateLastModified: Date
  },
  {
    timestamps: true
  }
);

// Index for faster queries
SolarCalculationSchema.index({ userId: 1, createdAt: -1 });
SolarCalculationSchema.index({ leadId: 1 });
SolarCalculationSchema.index({ proposalId: 1 });
SolarCalculationSchema.index({ savedByUser: 1 });

// Validate that monthly arrays have exactly 12 elements
SolarCalculationSchema.path('electricityUsage.monthly').validate(function(value) {
  return !value || value.length === 12;
}, 'Monthly electricity usage must have exactly 12 months of data');

SolarCalculationSchema.path('calculationResults.monthlyProduction').validate(function(value) {
  return !value || value.length === 12;
}, 'Monthly production must have exactly 12 months of data');

SolarCalculationSchema.path('shading.monthlyShadingLoss').validate(function(value) {
  return !value || value.length === 12;
}, 'Monthly shading loss must have exactly 12 months of data');

// Virtual property for average energy production per day
SolarCalculationSchema.virtual('calculationResults.dailyAverage').get(function() {
  if (this.calculationResults && this.calculationResults.annualProduction) {
    return this.calculationResults.annualProduction / 365;
  }
  return 0;
});

// Method to calculate monthly bill savings
SolarCalculationSchema.methods.calculateMonthlySavings = function() {
  const { annualProduction } = this.calculationResults;
  const { rate } = this.electricityUsage;
  
  if (annualProduction && rate) {
    return (annualProduction * rate) / 12;
  }
  return 0;
};

// Method to get solar offset percentage achievement
SolarCalculationSchema.methods.getActualOffset = function() {
  const { annualProduction } = this.calculationResults;
  const { annual } = this.electricityUsage;
  
  if (annualProduction && annual) {
    return (annualProduction / annual) * 100;
  }
  return 0;
};

// Static method to find calculations by lead
SolarCalculationSchema.statics.findByLead = function(leadId) {
  return this.find({ leadId }).sort({ createdAt: -1 });
};

// Static method to find saved calculations by user
SolarCalculationSchema.statics.findSavedByUser = function(userId) {
  return this.find({ userId, savedByUser: true }).sort({ createdAt: -1 });
};

const SolarCalculation = mongoose.model('SolarCalculation', SolarCalculationSchema);

module.exports = SolarCalculation;