const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
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
    alternatePhone: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'government'],
      default: 'residential',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    contactPerson: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    lifetimeValue: {
      type: Number,
      default: 0,
    },
    totalProjects: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text indexes for search
customerSchema.index({ 
  name: 'text', 
  email: 'text', 
  phone: 'text', 
  address: 'text',
  contactPerson: 'text',
  gstNumber: 'text'
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;