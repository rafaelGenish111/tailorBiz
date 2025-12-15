// backend/src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getClientDocuments,
  updateDocument,
  deleteDocument,
  archiveDocument
} = require('../controllers/documentController');
const { uploadDocument: uploadMiddleware } = require('../config/cloudinary');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/client/:clientId')
  .get(getClientDocuments)
  .post(uploadMiddleware.single('file'), uploadDocument);

router.route('/:documentId')
  .put(updateDocument)
  .delete(deleteDocument);

router.put('/:documentId/archive', archiveDocument);

module.exports = router;








