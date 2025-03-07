const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { 
  calculateSystemSize,
  calculateFinancials,
  calculateEnvironmentalImpact,
  estimateMonthlyProduction,
  saveCalculation,
  getAvailableEquipment,
  getSavedCalculations,
  getCalculationById
} = require('./solarCalculationController');

// Calculate system size
router.post('/system-size', protect, calculateSystemSize);

// Calculate financial metrics
router.post('/financials', protect, calculateFinancials);

// Calculate environmental impact
router.post('/environmental-impact', protect, calculateEnvironmentalImpact);

// Estimate monthly production
router.post('/monthly-production', protect, estimateMonthlyProduction);

// Save calculation
router.post('/save', protect, saveCalculation);

// Get available equipment
router.get('/equipment/:type', protect, getAvailableEquipment);

// Get user's saved calculations
router.get('/saved', protect, getSavedCalculations);

// Get calculation by ID
router.get('/:id', protect, getCalculationById);

module.exports = router;