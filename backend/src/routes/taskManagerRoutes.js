// backend/src/routes/taskManagerRoutes.js
const express = require('express');
const router = express.Router();
const taskManagerController = require('../controllers/taskManagerController');
const { protect, authorize } = require('../middleware/auth.middleware');

// כל הנתיבים דורשים אימות
router.use(protect);

// תצוגות מיוחדות
router.get('/views/today-agenda', taskManagerController.getTodayAgenda);
router.get('/views/calendar', taskManagerController.getCalendarView);
router.get('/views/by-day', taskManagerController.getTasksByDay);
router.get('/views/gantt', taskManagerController.getGanttView);

// סטטיסטיקות
router.get('/stats/overview', taskManagerController.getTaskStats);

// CRUD בסיסי (חייב לבוא אחרי /views ו-/stats כדי לא לבלוע אותם עם /:id)
router.get('/', taskManagerController.getAllTasks);
router.post('/', taskManagerController.createTask);
router.get('/:id', taskManagerController.getTaskById);
router.put('/:id', taskManagerController.updateTask);
router.delete('/:id', taskManagerController.deleteTask);

module.exports = router;




