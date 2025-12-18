const mongoose = require('mongoose');

const ProspectSchema = new mongoose.Schema({
  companyName: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  phone: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted_to_lead', 'discarded'],
    default: 'pending',
  },
  notes: { type: String, trim: true },
}, {
  timestamps: true,
});

const HuntingPoolSchema = new mongoose.Schema({
  sectorName: {
    type: String,
    required: [true, 'sectorName הוא שדה חובה'],
    trim: true,
    unique: true,
  },
  description: { type: String, trim: true },
  prospects: [ProspectSchema],
}, {
  timestamps: true,
});

HuntingPoolSchema.index({ 'prospects.status': 1 });

module.exports = mongoose.model('HuntingPool', HuntingPoolSchema);
