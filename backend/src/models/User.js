const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'sales', 'technician', 'customer_service', 'viewer'],
      default: 'sales',
    },
    permissions: {
      proposal: {
        create: { type: Boolean, default: false },
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
        finalApprove: { type: Boolean, default: false },
      },
      project: {
        create: { type: Boolean, default: false },
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: false },
      },
      serviceRequest: {
        create: { type: Boolean, default: false },
        view: { type: Boolean, default: true },
        edit: { type: Boolean, default: false },
        assign: { type: Boolean, default: false },
      },
      user: {
        create: { type: Boolean, default: false },
        view: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
    },
    department: {
      type: String,
      enum: ['management', 'sales', 'operations', 'service', 'finance'],
      default: 'sales',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Password encryption
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Role-based permission setting
userSchema.pre('save', function (next) {
  // Set permissions based on role
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        // Admin has all permissions
        Object.keys(this.permissions).forEach(resource => {
          Object.keys(this.permissions[resource]).forEach(action => {
            this.permissions[resource][action] = true;
          });
        });
        break;
      case 'manager':
        // Managers can create/view/edit but not final approve
        this.permissions.proposal.create = true;
        this.permissions.proposal.view = true;
        this.permissions.proposal.edit = true;
        this.permissions.proposal.approve = true;
        this.permissions.proposal.finalApprove = false;
        
        this.permissions.project.create = true;
        this.permissions.project.view = true;
        this.permissions.project.edit = true;
        
        this.permissions.serviceRequest.create = true;
        this.permissions.serviceRequest.view = true;
        this.permissions.serviceRequest.edit = true;
        this.permissions.serviceRequest.assign = true;
        
        this.permissions.user.view = true;
        break;
      case 'sales':
        // Sales can work with proposals and view projects
        this.permissions.proposal.create = true;
        this.permissions.proposal.view = true;
        this.permissions.proposal.edit = true;
        
        this.permissions.project.view = true;
        
        this.permissions.serviceRequest.create = true;
        this.permissions.serviceRequest.view = true;
        break;
      case 'technician':
        // Technicians focus on service requests
        this.permissions.serviceRequest.view = true;
        this.permissions.serviceRequest.edit = true;
        
        this.permissions.project.view = true;
        break;
      case 'customer_service':
        // Customer service can see everything but modify little
        this.permissions.proposal.view = true;
        this.permissions.project.view = true;
        this.permissions.serviceRequest.view = true;
        this.permissions.serviceRequest.create = true;
        break;
      case 'viewer':
        // Viewers can only view things
        this.permissions.proposal.view = true;
        this.permissions.project.view = true;
        this.permissions.serviceRequest.view = true;
        break;
    }
  }
  next();
});

// Method to match entered password with stored password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;