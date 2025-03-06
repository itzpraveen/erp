const mongoose = require('mongoose');

const incentiveSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const financingOptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    termMonths: {
      type: Number,
      default: 0,
    },
    monthlyPayment: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    downPayment: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const systemDetailsSchema = mongoose.Schema(
  {
    totalCapacity: {
      type: Number,
      required: true,
    },
    panelType: {
      type: String,
    },
    panelCount: {
      type: Number,
    },
    inverterType: {
      type: String,
    },
    estimatedProduction: {
      type: Number,
    },
    batteryStorage: {
      type: Boolean,
      default: false,
    },
    batteryCapacity: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const financialDetailsSchema = mongoose.Schema(
  {
    totalCost: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
    },
    incentives: [incentiveSchema],
    netCost: {
      type: Number,
      required: true,
    },
    paybackPeriod: {
      type: Number,
    },
    financingOptions: [financingOptionSchema],
    selectedFinancing: {
      type: String,
    },
  },
  { _id: false }
);

const proposalSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    systemDetails: systemDetailsSchema,
    financialDetails: financialDetailsSchema,
    status: {
      type: String,
      enum: ['draft', 'sent', 'negotiating', 'accepted', 'rejected'],
      default: 'draft',
    },
    estimatedInstallDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    documentUrl: {
      type: String,
    },
    history: [
      {
        version: Number,
        status: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create text index for search
proposalSchema.index(
  { title: 'text', notes: 'text' },
  { name: 'proposal_text_index' }
);

// Create compound index for filtering
proposalSchema.index(
  { status: 1, createdAt: -1 },
  { name: 'status_date_index' }
);

// Calculate amount saved from incentives
proposalSchema.methods.calculateSavings = function () {
  if (!this.financialDetails || !this.financialDetails.incentives) {
    return 0;
  }
  
  return this.financialDetails.incentives.reduce(
    (total, incentive) => total + incentive.amount,
    0
  );
};

// Calculate monthly savings
proposalSchema.methods.calculateMonthlySavings = function () {
  if (!this.systemDetails || !this.systemDetails.estimatedProduction) {
    return 0;
  }
  
  // Assuming average electricity cost of ₹8 per kWh (Indian electricity rate)
  const electricityRate = 8;
  const annualProduction = this.systemDetails.estimatedProduction;
  
  return (annualProduction * electricityRate) / 12;
};

// Format currency based on the currency type
proposalSchema.methods.formatCurrency = function (amount) {
  const currency = this.financialDetails?.currency || 'INR';
  const currencies = {
    INR: { locale: 'en-IN', symbol: '₹' },
    USD: { locale: 'en-US', symbol: '$' },
    EUR: { locale: 'de-DE', symbol: '€' },
    GBP: { locale: 'en-GB', symbol: '£' },
  };
  
  const { locale, symbol } = currencies[currency];
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;