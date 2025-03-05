const mongoose = require('mongoose');

const leadSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'call', 'email', 'other'],
      default: 'website',
    },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'industrial'],
      default: 'residential',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'],
      default: 'new',
    },
    notes: {
      type: String,
    },
    energyBill: {
      averageMonthly: Number,
      annualUsage: Number,
      billDocument: String, // file path or URL
    },
    roofDetails: {
      type: {
        material: String,
        age: Number,
        condition: String
      },
      default: {}
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;