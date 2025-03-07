/**
 * Solar Calculator Routes
 */
const express = require('express');
const router = express.Router();
const {
  getSystemSize,
  getFinancials,
  getMonthlyProduction,
  getEnergyOffset,
  getEmissionsReduction,
  getEquipment
} = require('../controllers/solarCalculatorController');
const { protect } = require('../middleware/authMiddleware');
const { cacheRoute } = require('../middleware/cacheMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { body, param } = require('express-validator');

// Validation rules
const systemSizeValidation = [
  body('monthlyUsage')
    .isNumeric().withMessage('Monthly usage must be a number')
    .isFloat({ min: 1 }).withMessage('Monthly usage must be positive'),
  body('offsetPercentage')
    .optional()
    .isNumeric().withMessage('Offset percentage must be a number')
    .isFloat({ min: 1, max: 200 }).withMessage('Offset percentage must be between 1 and 200'),
  body('sunHoursPerDay')
    .isNumeric().withMessage('Sun hours per day must be a number')
    .isFloat({ min: 0.5, max: 12 }).withMessage('Sun hours per day must be between 0.5 and 12'),
  body('systemLosses')
    .optional()
    .isNumeric().withMessage('System losses must be a number')
    .isFloat({ min: 0, max: 50 }).withMessage('System losses must be between 0 and 50')
];

const financialsValidation = [
  body('systemSizeKW')
    .isNumeric().withMessage('System size must be a number')
    .isFloat({ min: 0.5 }).withMessage('System size must be at least 0.5 kW'),
  body('installationCost')
    .isNumeric().withMessage('Installation cost must be a number')
    .isFloat({ min: 1 }).withMessage('Installation cost must be positive'),
  body('electricityRate')
    .isNumeric().withMessage('Electricity rate must be a number')
    .isFloat({ min: 0.01 }).withMessage('Electricity rate must be positive'),
  body('annualProduction')
    .isNumeric().withMessage('Annual production must be a number')
    .isFloat({ min: 1 }).withMessage('Annual production must be positive'),
  body('annualDegradation')
    .optional()
    .isNumeric().withMessage('Annual degradation must be a number')
    .isFloat({ min: 0, max: 5 }).withMessage('Annual degradation must be between 0 and 5'),
  body('electricityInflation')
    .optional()
    .isNumeric().withMessage('Electricity inflation must be a number')
    .isFloat({ min: 0, max: 10 }).withMessage('Electricity inflation must be between 0 and 10'),
  body('financingYears')
    .optional()
    .isNumeric().withMessage('Financing years must be a number')
    .isInt({ min: 0, max: 30 }).withMessage('Financing years must be between 0 and 30'),
  body('interestRate')
    .optional()
    .isNumeric().withMessage('Interest rate must be a number')
    .isFloat({ min: 0, max: 30 }).withMessage('Interest rate must be between 0 and 30')
];

const productionValidation = [
  body('systemSizeKW')
    .isNumeric().withMessage('System size must be a number')
    .isFloat({ min: 0.5 }).withMessage('System size must be at least 0.5 kW'),
  body('location')
    .isObject().withMessage('Location data is required'),
  body('tilt')
    .optional()
    .isNumeric().withMessage('Tilt must be a number')
    .isFloat({ min: 0, max: 90 }).withMessage('Tilt must be between 0 and 90 degrees'),
  body('azimuth')
    .optional()
    .isNumeric().withMessage('Azimuth must be a number')
    .isFloat({ min: 0, max: 359 }).withMessage('Azimuth must be between 0 and 359 degrees')
];

// System size calculation
router.post(
  '/system-size',
  protect,
  systemSizeValidation,
  validate,
  getSystemSize
);

// Financial metrics calculation
router.post(
  '/financials',
  protect,
  financialsValidation,
  validate,
  getFinancials
);

// Monthly production calculation
router.post(
  '/production',
  protect,
  productionValidation,
  validate,
  cacheRoute('solar:production', 3600), // Cache for 1 hour
  getMonthlyProduction
);

// Energy offset calculation
router.post(
  '/offset',
  protect,
  [
    body('annualProduction')
      .isNumeric().withMessage('Annual production must be a number')
      .isFloat({ min: 1 }).withMessage('Annual production must be positive'),
    body('annualConsumption')
      .isNumeric().withMessage('Annual consumption must be a number')
      .isFloat({ min: 1 }).withMessage('Annual consumption must be positive')
  ],
  validate,
  getEnergyOffset
);

// Emissions reduction calculation
router.post(
  '/emissions',
  protect,
  [
    body('annualProduction')
      .isNumeric().withMessage('Annual production must be a number')
      .isFloat({ min: 1 }).withMessage('Annual production must be positive'),
    body('region')
      .optional()
      .isString().withMessage('Region must be a string')
  ],
  validate,
  getEmissionsReduction
);

// Get equipment options
router.get(
  '/equipment/:type',
  protect,
  [
    param('type')
      .isString().withMessage('Equipment type must be a string')
      .isIn(['panels', 'inverters', 'batteries', 'racking']).withMessage('Invalid equipment type')
  ],
  validate,
  cacheRoute('solar:equipment', 86400), // Cache for 24 hours
  getEquipment
);

module.exports = router;