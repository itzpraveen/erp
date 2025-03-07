const mongoose = require('mongoose');

const serviceRequestSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
      validate: {
        validator: function(v) {
          // Allow null or valid ObjectId
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: props => `${props.value} is not a valid project reference!`
      }
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['maintenance', 'repair', 'inspection', 'warranty_claim', 'system_upgrade', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['new', 'assigned', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'new',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    scheduledDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
    },
    actualHours: {
      type: Number,
    },
    partsUsed: [
      {
        name: String,
        partNumber: String,
        quantity: Number,
        cost: Number,
      },
    ],
    images: [
      {
        description: String,
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: [
      {
        text: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolution: {
      description: String,
      date: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    customerFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
      date: Date,
    },
    cost: {
      laborCost: Number,
      partsCost: Number,
      totalCost: Number,
      invoiced: {
        type: Boolean,
        default: false,
      },
      invoiceNumber: String,
      invoiceDate: Date,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partial', 'waived'],
        default: 'pending',
      },
    },
    warrantyRelated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;