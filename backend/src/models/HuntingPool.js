const mongoose = require('mongoose');

const ProspectSchema = new mongoose.Schema({
  companyName: { type: String, trim: true }, // יכול לשמש כשם החברה שלינקדאין מציג
  contactPerson: { type: String, trim: true }, // שם הליד
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true }, // הוספנו אימייל
  platform: { type: String, default: 'manual' }, // linkedin, facebook, etc.
  profileUrl: { type: String, trim: true }, // הלינק לפרופיל
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted_to_lead', 'discarded', 'new'], // הוספנו 'new'
    default: 'new',
  },
  notes: { type: String, trim: true },
  metadata: { type: Map, of: String } // לשמירת נתונים נוספים כמו תפקיד ומיקום
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
HuntingPoolSchema.index({ 'prospects.profileUrl': 1 }); // אינדקס למניעת כפילויות

module.exports = mongoose.model('HuntingPool', HuntingPoolSchema);