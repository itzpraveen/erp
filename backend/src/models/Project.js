const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    contractNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: [
        'planning',
        'permitting',
        'scheduled',
        'in_progress',
        'inspection',
        'completed',
        'cancelled',
      ],
      default: 'planning',
    },
    timeline: {
      contractSigned: Date,
      permitSubmitted: Date,
      permitApproved: Date,
      installationStart: Date,
      installationEnd: Date,
      inspectionDate: Date,
      gridConnectionDate: Date,
      completionDate: Date,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    installationTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    equipmentUsed: [
      {
        type: {
          type: String,
          enum: ['panel', 'inverter', 'battery', 'other'],
        },
        manufacturer: String,
        model: String,
        serialNumber: String,
        quantity: Number,
      },
    ],
    permitDetails: {
      permitNumber: String,
      issuedBy: String,
      applicationDate: Date,
      approvalDate: Date,
      documents: [
        {
          name: String,
          fileUrl: String,
        },
      ],
    },
    inspectionDetails: [
      {
        inspectionType: String,
        inspectionDate: Date,
        inspector: String,
        status: {
          type: String,
          enum: ['scheduled', 'passed', 'failed', 'pending'],
        },
        notes: String,
        documents: [
          {
            name: String,
            fileUrl: String,
          },
        ],
      },
    ],
    paymentSchedule: [
      {
        description: String,
        amount: Number,
        dueDate: Date,
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
          default: 'pending',
        },
        paymentDate: Date,
        paymentMethod: String,
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
    documents: [
      {
        name: String,
        category: String,
        fileUrl: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;