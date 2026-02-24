// backend/src/models/SignableDocument.js
const mongoose = require('mongoose');

const signableDocumentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },

  // Document identity
  documentNumber: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  documentType: {
    type: String,
    enum: ['contract', 'agreement', 'form', 'proposal', 'other'],
    default: 'contract'
  },
  content: {
    type: String,
    required: true
  },

  // Business info snapshot (pulled from SiteSettings at creation time)
  businessInfo: {
    name: String,
    address: String,
    phone: String,
    email: String,
    taxId: String,
    logoUrl: String,
    letterheadHeaderUrl: String,
    letterheadFooterUrl: String
  },

  // Client info snapshot
  clientInfo: {
    name: String,
    email: String,
    phone: String,
    businessName: String
  },

  // Delivery
  sentVia: [{
    type: String,
    enum: ['email', 'whatsapp']
  }],
  sentAt: Date,

  // Public access token (JWT)
  accessToken: {
    type: String,
    index: true
  },
  tokenExpiresAt: Date,

  // Lifecycle status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'signed', 'expired'],
    default: 'draft'
  },
  viewedAt: Date,

  // Signature data
  signedAt: Date,
  signerName: {
    type: String,
    trim: true
  },
  signerIp: String,
  signatureImageBase64: String,

  // Result
  signedPdfUrl: String,
  signedPdfCloudinaryId: String,
  relatedDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }
}, {
  timestamps: true
});

// Auto-generate document number: SD2026-0001
signableDocumentSchema.pre('save', async function (next) {
  try {
    if (!this.documentNumber) {
      const year = new Date().getFullYear();

      const lastDoc = await this.constructor
        .findOne({ documentNumber: new RegExp(`^SD${year}-`) })
        .sort({ documentNumber: -1 })
        .select('documentNumber')
        .lean();

      let nextNumber = 1;

      if (lastDoc?.documentNumber) {
        const parts = lastDoc.documentNumber.split('-');
        const lastSeq = parseInt(parts[1], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }

      this.documentNumber = `SD${year}-${String(nextNumber).padStart(4, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

signableDocumentSchema.index({ clientId: 1, createdAt: -1 });
signableDocumentSchema.index({ status: 1 });

module.exports = mongoose.model('SignableDocument', signableDocumentSchema);
