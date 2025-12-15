const ClientLogo = require('../models/ClientLogo');

exports.listClients = async (req, res) => {
  try {
    const items = await ClientLogo.find({})
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error in listClients:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת לקוחות', error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const created = await ClientLogo.create({
      name: req.body.name,
      websiteUrl: req.body.websiteUrl || '',
      logo: req.body.logo,
      order: req.body.order ?? 0,
      isPublished: req.body.isPublished ?? true
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error in createClient:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת לקוח', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const updated = await ClientLogo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'לקוח לא נמצא' });
    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateClient:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון לקוח', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const deleted = await ClientLogo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'לקוח לא נמצא' });
    return res.json({ success: true, message: 'לקוח נמחק' });
  } catch (error) {
    console.error('Error in deleteClient:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקת לקוח', error: error.message });
  }
};

exports.reorderClients = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids חייב להיות מערך' });
    }
    await Promise.all(
      ids.map((id, index) => ClientLogo.findByIdAndUpdate(id, { order: index }))
    );
    const items = await ClientLogo.find({}).sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error in reorderClients:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בסידור לקוחות', error: error.message });
  }
};

