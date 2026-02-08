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
        stats: doc.stats || {},
        showClientsInNav: doc.showClientsInNav !== undefined ? doc.showClientsInNav : false,
        showClientsOnHome: doc.showClientsOnHome !== undefined ? doc.showClientsOnHome : false,
        showProductsInNav: doc.showProductsInNav !== undefined ? doc.showProductsInNav : true,
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
    const { company, contact, socials, hours, stats, showClientsInNav, showClientsOnHome, showProductsInNav } = req.body || {};

    const updateData = {};
    if (company) updateData.company = company;
    if (contact) updateData.contact = contact;
    if (socials) updateData.socials = socials;
    if (hours) updateData.hours = hours;
    if (stats) updateData.stats = stats;
    if (showClientsInNav !== undefined) updateData.showClientsInNav = showClientsInNav;
    if (showClientsOnHome !== undefined) updateData.showClientsOnHome = showClientsOnHome;
    if (showProductsInNav !== undefined) updateData.showProductsInNav = showProductsInNav;

    const updated = await SiteSettings.findOneAndUpdate(
      { key: DEFAULT_KEY },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateAdmin site settings:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בשמירת הגדרות האתר', error: error.message });
  }
};
