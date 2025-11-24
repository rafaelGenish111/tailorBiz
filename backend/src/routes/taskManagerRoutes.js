// backend/src/routes/taskManagerRoutes.js
const express = require('express');
const router = express.Router();
const taskManagerController = require('../controllers/taskManagerController');
const { protect, authorize } = require('../middleware/auth.middleware');

// כל הנתיבים דורשים אימות
router.use(protect);

// CRUD בסיסי
router.get('/', taskManagerController.getAllTasks);
router.get('/:id', taskManagerController.getTaskById);
router.post('/', taskManagerController.createTask);
router.put('/:id', taskManagerController.updateTask);
router.delete('/:id', taskManagerController.deleteTask);

// תצוגות מיוחדות
router.get('/views/today-agenda', taskManagerController.getTodayAgenda);
router.get('/views/calendar', taskManagerController.getCalendarView);

// סטטיסטיקות
router.get('/stats/overview', taskManagerController.getTaskStats);

module.exports = router;

