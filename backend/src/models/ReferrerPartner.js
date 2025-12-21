const mongoose = require('mongoose');

const ReferrerPartnerSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: [true, 'displayName הוא שדה חובה'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['business_consultant', 'accountant', 'lawyer', 'other'],
    default: 'other',
  },
  contact: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  worksWith: {
    type: String,
    trim: true,
    default: '',
  },
  cooperationTerms: {
    type: String,
    trim: true,
    default: '',
  },
  commissionModel: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['prospecting', 'contacted', 'negotiating', 'active', 'inactive'],
    default: 'prospecting',
  },
  closing: {
    closedAt: Date,
    summary: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
}, {
  timestamps: true,
});

ReferrerPartnerSchema.index({ displayName: 1 });
ReferrerPartnerSchema.index({ status: 1 });
ReferrerPartnerSchema.index({ category: 1 });

module.exports = mongoose.model('ReferrerPartner', ReferrerPartnerSchema);


