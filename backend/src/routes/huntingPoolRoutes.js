const express = require('express');
const router = express.Router();

const huntingPoolController = require('../controllers/huntingPoolController');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);
// שימוש באותן הרשאות כמו לידים/לקוחות (אדמין תמיד מותר)
router.use(requireAnyModule(['leads', 'clients']));

router
  .route('/')
  .get(huntingPoolController.getPools)
  .post(huntingPoolController.createPool);

router.post('/:poolId/prospects', huntingPoolController.addProspectToPool);

router.patch('/:poolId/prospects/:prospectId', huntingPoolController.updateProspectStatus);

module.exports = router;
