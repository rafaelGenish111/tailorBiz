const express = require('express');
const router = express.Router();

const referrerPartnersController = require('../controllers/referrerPartnersController');
const { protect, requireAnyModule } = require('../middleware/auth.middleware');

// כל ה-routes דורשים אימות
router.use(protect);
// שימוש באותן הרשאות כמו לידים/לקוחות (אדמין תמיד מותר)
router.use(requireAnyModule(['leads', 'clients']));

router
  .route('/')
  .get(referrerPartnersController.listReferrers)
  .post(referrerPartnersController.createReferrer);

router
  .route('/:id')
  .get(referrerPartnersController.getReferrerById)
  .patch(referrerPartnersController.updateReferrer);

router.post('/:id/close', referrerPartnersController.closeReferrer);

module.exports = router;


