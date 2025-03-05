const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  assignInstallationTeam,
  updateProjectStatus,
  addProjectEquipment,
  addInspectionDetails,
  getProjectStats,
} = require('../controllers/projectController');
const { protect, admin, checkRole } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, checkRole(['admin', 'manager']), createProject)
  .get(protect, getProjects);

router.route('/stats').get(protect, checkRole(['admin', 'manager']), getProjectStats);

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(protect, checkRole(['admin', 'manager']), updateProject);

router
  .route('/:id/assign-team')
  .put(protect, checkRole(['admin', 'manager']), assignInstallationTeam);

router
  .route('/:id/status')
  .put(
    protect,
    checkRole(['admin', 'manager', 'projectManager']),
    updateProjectStatus
  );

router.route('/:id/equipment').post(protect, addProjectEquipment);

router.route('/:id/inspections').post(protect, addInspectionDetails);

module.exports = router;