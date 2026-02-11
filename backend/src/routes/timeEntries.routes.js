const express = require('express');
const router = express.Router();
const timeEntriesController = require('../controllers/timeEntriesController');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireAnyModule(['clients', 'leads']));

router.get('/active', timeEntriesController.getActive);
router.post('/client/:clientId/start', timeEntriesController.start);
router.put('/:entryId/stop', timeEntriesController.stop);
router.get('/client/:clientId', timeEntriesController.getClientEntries);
router.post('/client/:clientId/manual', timeEntriesController.addManual);
router.put('/:entryId', timeEntriesController.update);
router.delete('/:entryId', timeEntriesController.remove);

module.exports = router;
