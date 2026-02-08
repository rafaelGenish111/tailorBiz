const mongoose = require('mongoose');

/**
 * SiteSettings
 * Singleton document for site-wide settings used by public pages (footer/contact).
 */
const SiteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'default'
    },

    company: {
      name: { type: String, trim: true, default: 'TailorBiz' },
      tagline: { type: String, trim: true, default: '' }
    },

    contact: {
      email: { type: String, trim: true, default: 'info@tailorbiz.com' },
      phone: { type: String, trim: true, default: '' },
      whatsapp: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' }
    },

    socials: {
      facebook: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      tiktok: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' }
    },

    hours: {
      sundayToThursday: { type: String, trim: true, default: 'ראשון - חמישי: 9:00 - 18:00' },
      friday: { type: String, trim: true, default: 'שישי: 9:00 - 13:00' }
    },

    stats: {
      hoursSaved: { value: { type: Number, default: 10 }, suffix: { type: String, default: '+' }, label: { type: String, default: 'שעות חיסכון שבועי' } },
      satisfaction: { value: { type: Number, default: 95 }, suffix: { type: String, default: '%' }, label: { type: String, default: 'שביעות רצון' } },
      businesses: { value: { type: Number, default: 500 }, suffix: { type: String, default: '+' }, label: { type: String, default: 'עסקים משתמשים' } },
      support: { value: { type: Number, default: 24 }, suffix: { type: String, default: '/7' }, label: { type: String, default: 'תמיכה' } }
    },

    showClientsInNav: { type: Boolean, default: false },
    showClientsOnHome: { type: Boolean, default: false },
    showProductsInNav: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
