const { validationResult, body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validation middleware to process validation errors
 * @returns {Function} Express middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validates MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Common validation rules
const commonValidations = {
  // ID validations
  id: param('id')
    .notEmpty()
    .withMessage('ID is required')
    .custom(value => isValidObjectId(value))
    .withMessage('Invalid ID format'),
  
  // Generic field validations
  required: (field) => body(field)
    .notEmpty()
    .withMessage(`${field} is required`),
  
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO date')
  ]
};

// User validations
const userValidations = {
  register: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'sales', 'technician', 'customer_service', 'viewer'])
      .withMessage('Invalid role')
  ],
  
  login: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  
  updateProfile: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .optional()
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('currentPassword')
      .if(body('password').exists())
      .notEmpty().withMessage('Current password is required when updating password')
  ]
};

// Lead validations
const leadValidations = {
  create: [
    body('name')
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .isEmail().withMessage('Please provide a valid email'),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source')
      .optional()
      .isIn(['website', 'referral', 'social_media', 'call', 'email', 'other'])
      .withMessage('Invalid lead source'),
    body('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'])
      .withMessage('Invalid status'),
    body('assignedTo')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid assignedTo ID format')
  ],
  
  update: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .optional()
      .isEmail().withMessage('Please provide a valid email'),
    body('phone')
      .optional()
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source')
      .optional()
      .isIn(['website', 'referral', 'social_media', 'call', 'email', 'other'])
      .withMessage('Invalid lead source'),
    body('status')
      .optional()
      .isIn(['new', 'contacted', 'qualified', 'proposal', 'closed_won', 'closed_lost'])
      .withMessage('Invalid status'),
    body('assignedTo')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid assignedTo ID format')
  ]
};

// Project validations
const projectValidations = {
  create: [
    body('proposal')
      .notEmpty().withMessage('Proposal ID is required')
      .custom(value => isValidObjectId(value))
      .withMessage('Invalid proposal ID format'),
    body('customer')
      .notEmpty().withMessage('Customer ID is required')
      .custom(value => isValidObjectId(value))
      .withMessage('Invalid customer ID format'),
    body('projectManager')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid project manager ID format'),
    body('startDate')
      .optional()
      .isISO8601().withMessage('Start date must be a valid date')
  ],
  
  update: [
    body('status')
      .optional()
      .isIn(['planning', 'permitting', 'scheduled', 'in_progress', 'inspection', 'completed', 'cancelled'])
      .withMessage('Invalid project status'),
    body('projectManager')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid project manager ID format'),
    body('installationTeam')
      .optional()
      .isArray().withMessage('Installation team must be an array'),
    body('installationTeam.*')
      .optional()
      .custom(value => isValidObjectId(value))
      .withMessage('Invalid team member ID format')
  ]
};

// Service request validations
const serviceRequestValidations = {
  create: [
    body('customer')
      .notEmpty().withMessage('Customer ID is required')
      .custom(value => isValidObjectId(value))
      .withMessage('Invalid customer ID format'),
    body('project')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid project ID format'),
    body('type')
      .notEmpty().withMessage('Service request type is required')
      .isIn(['maintenance', 'repair', 'inspection', 'warranty_claim', 'system_upgrade'])
      .withMessage('Invalid service request type'),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level')
  ],
  
  update: [
    body('status')
      .optional()
      .isIn(['new', 'assigned', 'scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled'])
      .withMessage('Invalid service request status'),
    body('assignedTechnician')
      .optional()
      .custom(value => !value || isValidObjectId(value))
      .withMessage('Invalid technician ID format'),
    body('scheduledDate')
      .optional()
      .isISO8601().withMessage('Scheduled date must be a valid date')
  ]
};

module.exports = {
  validate,
  commonValidations,
  userValidations,
  leadValidations,
  projectValidations,
  serviceRequestValidations
};