// backend/routes/timeEntryRoutes.js
const express = require('express');
const router = express.Router();
const {
  startTimer,
  stopTimer,
  getActiveTimer,
  getClientTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  addManualEntry
} = require('../controllers/timeEntryController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// טיימר פעיל
router.get('/active', getActiveTimer);

// פעולות על לקוח ספציפי
router.post('/client/:clientId/start', startTimer);
router.get('/client/:clientId', getClientTimeEntries);
router.post('/client/:clientId/manual', addManualEntry);

// פעולות על entry ספציפי
router.put('/:entryId/stop', stopTimer);
router.put('/:entryId', updateTimeEntry);
router.delete('/:entryId', deleteTimeEntry);

module.exports = router;


