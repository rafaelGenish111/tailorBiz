const express = require('express');
const router = express.Router();

const huntingPoolController = require('../controllers/huntingPoolController');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');

// --- נתיבים פתוחים (עבור התוסף) ---
// שים לב: זה חייב להיות לפני ה-protect!
router.post('/add', huntingPoolController.addFromExtension);

// --- נתיבים מוגנים (עבור המערכת) ---
router.use(protect);
router.use(requireAnyModule(['leads', 'clients']));

router
  .route('/')
  .get(huntingPoolController.getPools)
  .post(huntingPoolController.createPool);

router.post('/:poolId/prospects', huntingPoolController.addProspectToPool);

router.patch('/:poolId/prospects/:prospectId', huntingPoolController.updateProspectStatus);

module.exports = router;