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

const approvalSchema = mongoose.Schema(
  {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    comments: {
      type: String,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending_changes', 'submitted'],
      default: 'submitted',
    },
  },
  { _id: false }
);

const adjustmentRequestSchema = mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    field: {
      type: String,
    },
    currentValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    requestedValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    comments: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'implemented', 'rejected'],
      default: 'pending',
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
    // New approval workflow fields
    approvalStatus: {
      type: String,
      enum: ['draft', 'submitted', 'manager_approved', 'admin_approved', 'rejected'],
      default: 'draft',
    },
    approvalHistory: [approvalSchema],
    currentApprover: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    finalApproval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: {
        type: Date,
      },
      comments: {
        type: String,
      },
    },
    adjustmentRequests: [adjustmentRequestSchema],
    // End of new approval workflow fields
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
    previousVersions: [{
      data: {
        type: mongoose.Schema.Types.Mixed,
      },
      updatedAt: {
        type: Date,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
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

// Approval workflow methods
proposalSchema.methods.submitForApproval = function(userId) {
  this.approvalStatus = 'submitted';
  this.approvalHistory.push({
    approvedBy: userId,
    status: 'submitted',
    comments: 'Proposal submitted for approval',
  });
  
  return this.save();
};

proposalSchema.methods.approveByManager = function(managerId, comments) {
  this.approvalStatus = 'manager_approved';
  this.approvalHistory.push({
    approvedBy: managerId,
    status: 'approved',
    comments: comments || 'Approved by manager',
  });
  
  return this.save();
};

proposalSchema.methods.finalApproveByAdmin = function(adminId, comments) {
  this.approvalStatus = 'admin_approved';
  this.finalApproval = {
    approvedBy: adminId,
    approvedAt: new Date(),
    comments: comments || 'Final approval by admin',
  };
  this.approvalHistory.push({
    approvedBy: adminId,
    status: 'approved',
    comments: comments || 'Final approval by admin',
  });
  
  // Also update the status to accepted
  this.status = 'accepted';
  
  return this.save();
};

proposalSchema.methods.requestAdjustments = function(userId, adjustments) {
  this.approvalStatus = 'submitted'; // Reset to submitted
  
  // Add each adjustment request
  adjustments.forEach(adjustment => {
    this.adjustmentRequests.push({
      requestedBy: userId,
      field: adjustment.field,
      currentValue: adjustment.currentValue,
      requestedValue: adjustment.requestedValue,
      comments: adjustment.comments,
    });
  });
  
  this.approvalHistory.push({
    approvedBy: userId,
    status: 'pending_changes',
    comments: 'Adjustments requested',
  });
  
  return this.save();
};

proposalSchema.methods.implementAdjustments = function(userId) {
  // Save current version before implementing changes
  const currentData = this.toObject();
  delete currentData._id;
  delete currentData.previousVersions;
  
  this.previousVersions.push({
    data: currentData,
    updatedAt: new Date(),
    updatedBy: userId,
  });
  
  this.version += 1;
  
  // Mark all pending adjustments as implemented
  this.adjustmentRequests.forEach(adjustment => {
    if (adjustment.status === 'pending') {
      adjustment.status = 'implemented';
    }
  });
  
  // Change status back to submitted
  this.approvalStatus = 'submitted';
  
  return this.save();
};

proposalSchema.methods.reject = function(userId, reason) {
  this.approvalStatus = 'rejected';
  this.status = 'rejected';
  this.approvalHistory.push({
    approvedBy: userId,
    status: 'rejected',
    comments: reason || 'Proposal rejected',
  });
  
  return this.save();
};

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;