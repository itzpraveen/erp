const mongoose = require('mongoose');

const proposalSchema = mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    systemDetails: {
      totalCapacity: Number, // in kW
      panelType: String,
      panelCount: Number,
      inverterType: String,
      estimatedProduction: Number, // in kWh per year
      batteryStorage: Boolean,
      batteryCapacity: Number, // in kWh
    },
    financialDetails: {
      totalCost: Number,
      incentives: [
        {
          name: String,
          amount: Number,
        },
      ],
      netCost: Number,
      paybackPeriod: Number, // in years
      financingOptions: [
        {
          name: String,
          termMonths: Number,
          monthlyPayment: Number,
          interestRate: Number,
          downPayment: Number,
        },
      ],
      selectedFinancing: String,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'negotiating', 'accepted', 'rejected'],
      default: 'draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documents: [
      {
        name: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    estimatedInstallDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;