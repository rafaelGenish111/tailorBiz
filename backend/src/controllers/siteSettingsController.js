const SiteSettings = require('../models/SiteSettings');

const DEFAULT_KEY = 'default';

async function getOrCreateSettings() {
  let doc = await SiteSettings.findOne({ key: DEFAULT_KEY });
  if (!doc) {
    doc = await SiteSettings.create({ key: DEFAULT_KEY });
  }
  return doc;
}

exports.getPublic = async (req, res) => {
  try {
    const doc = await getOrCreateSettings();
    return res.json({
      success: true,
      data: {
        company: doc.company || {},
        contact: doc.contact || {},
        socials: doc.socials || {},
        hours: doc.hours || {},
        updatedAt: doc.updatedAt
      }
    });
  } catch (error) {
    console.error('Error in getPublic site settings:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת הגדרות האתר', error: error.message });
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const doc = await getOrCreateSettings();
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in getAdmin site settings:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת הגדרות האתר', error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { company, contact, socials, hours } = req.body || {};

    const updated = await SiteSettings.findOneAndUpdate(
      { key: DEFAULT_KEY },
      {
        $set: {
          ...(company ? { company } : {}),
          ...(contact ? { contact } : {}),
          ...(socials ? { socials } : {}),
          ...(hours ? { hours } : {})
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateAdmin site settings:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשמירת הגדרות האתר', error: error.message });
  }
};
