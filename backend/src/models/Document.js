// backend/src/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'image', 'excel', 'other'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: false,
    default: null
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    default: 'raw'
  },
  category: {
    type: String,
    enum: ['quote', 'contract', 'invoice', 'receipt', 'proposal', 'specification', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  relatedQuoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }
}, {
  timestamps: true
});

documentSchema.index({ clientId: 1, category: 1 });
documentSchema.index({ clientId: 1, createdAt: -1 });

documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
});

documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);

