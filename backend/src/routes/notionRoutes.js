const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const notionSyncService = require('../services/notionSyncService');
const notionService = require('../services/notionService');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

// GET /api/admin/notion/status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: notionSyncService.enabled,
      databaseId: notionService.databaseId || null,
      configured: notionService.isReady()
    }
  });
});

// POST /api/admin/notion/sync-all
router.post('/sync-all', async (req, res) => {
  if (!notionSyncService.enabled) {
    return res.status(503).json({ success: false, message: 'Notion sync is disabled' });
  }
  try {
    const result = await notionSyncService.syncAll();
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[NotionRoute] sync-all error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/notion/sync/:projectId
router.post('/sync/:projectId', async (req, res) => {
  if (!notionSyncService.enabled) {
    return res.status(503).json({ success: false, message: 'Notion sync is disabled' });
  }
  try {
    await notionSyncService._doSync(req.params.projectId);
    return res.json({ success: true });
  } catch (err) {
    console.error(`[NotionRoute] sync/${req.params.projectId} error:`, err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
