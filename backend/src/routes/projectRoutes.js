const express = require('express');
const router = express.Router();
const {
  createProject,
  updateProject,
  deleteProject,
  getProject,
  getProjects
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth.middleware');

// כל הנתיבים דורשים אימות
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:projectId')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;





