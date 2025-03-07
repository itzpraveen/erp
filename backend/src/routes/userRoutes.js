const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');
const { 
  validate, 
  userValidations, 
  commonValidations 
} = require('../middleware/validationMiddleware');

// User registration and listing
router.route('/')
  .post(
    protect, 
    admin, 
    userValidations.register, 
    validate, 
    registerUser
  )
  .get(
    protect, 
    admin, 
    commonValidations.pagination, 
    validate, 
    getUsers
  );

// Authentication routes
router.post(
  '/login', 
  userValidations.login, 
  validate, 
  authUser
);

router.post('/logout', logoutUser);

// User profile routes
router.route('/profile')
  .get(
    protect, 
    getUserProfile
  )
  .put(
    protect, 
    userValidations.updateProfile, 
    validate, 
    updateUserProfile
  );

// User management routes
router.route('/:id')
  .get(
    protect, 
    admin, 
    commonValidations.id, 
    validate, 
    getUserById
  )
  .put(
    protect, 
    admin, 
    commonValidations.id, 
    userValidations.register, // Reuse register validations but they're optional
    validate, 
    updateUser
  )
  .delete(
    protect, 
    admin, 
    commonValidations.id, 
    validate, 
    deleteUser
  );

module.exports = router;