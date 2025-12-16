const express = require('express');
const router = express.Router();
const { protect, requireModule } = require('../middleware/auth.middleware');
const adminClientsController = require('../controllers/adminClientsController');

router.use(protect);
router.use(requireModule('cms'));

router.get('/', adminClientsController.listClients);
router.post('/', adminClientsController.createClient);
router.put('/:id', adminClientsController.updateClient);
router.delete('/:id', adminClientsController.deleteClient);
router.post('/reorder', adminClientsController.reorderClients);

module.exports = router;

