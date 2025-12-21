const mongoose = require('mongoose');
const ReferrerPartner = require('../models/ReferrerPartner');

const isValidObjectId = (id) => Boolean(id) && mongoose.Types.ObjectId.isValid(id);

exports.listReferrers = async (req, res) => {
  try {
    const { status, category, search } = req.query || {};

    const q = {};
    if (status) q.status = String(status).trim();
    if (category) q.category = String(category).trim();
    if (search) {
      const s = String(search).trim();
      if (s) {
        q.$or = [
          { displayName: { $regex: s, $options: 'i' } },
          { 'contact.phone': { $regex: s, $options: 'i' } },
          { 'contact.email': { $regex: s, $options: 'i' } },
        ];
      }
    }

    const items = await ReferrerPartner.find(q)
      .sort({ displayName: 1 })
      .select('-__v');

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error in listReferrers:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת רשימת מפנים', error: error.message });
  }
};

exports.createReferrer = async (req, res) => {
  try {
    const displayName = String(req.body?.displayName || '').trim();
    if (!displayName) {
      return res.status(400).json({ success: false, message: 'displayName הוא שדה חובה' });
    }

    const doc = await ReferrerPartner.create({
      displayName,
      category: req.body?.category,
      contact: {
        phone: req.body?.contact?.phone,
        email: req.body?.contact?.email,
      },
      worksWith: req.body?.worksWith,
      cooperationTerms: req.body?.cooperationTerms,
      commissionModel: req.body?.commissionModel,
      notes: req.body?.notes,
      status: req.body?.status,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in createReferrer:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת מפנה', error: error.message });
  }
};

exports.getReferrerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'id לא תקין' });
    }

    const doc = await ReferrerPartner.findById(id).select('-__v');
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מפנה לא נמצא' });
    }
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in getReferrerById:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מפנה', error: error.message });
  }
};

exports.updateReferrer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'id לא תקין' });
    }

    const doc = await ReferrerPartner.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מפנה לא נמצא' });
    }

    const patch = req.body || {};
    if (typeof patch.displayName === 'string') doc.displayName = patch.displayName;
    if (typeof patch.category === 'string') doc.category = patch.category;
    if (typeof patch.status === 'string') doc.status = patch.status;

    if (patch.contact && typeof patch.contact === 'object') {
      doc.contact = doc.contact || {};
      if (typeof patch.contact.phone === 'string') doc.contact.phone = patch.contact.phone;
      if (typeof patch.contact.email === 'string') doc.contact.email = patch.contact.email;
    }

    if (typeof patch.worksWith === 'string') doc.worksWith = patch.worksWith;
    if (typeof patch.cooperationTerms === 'string') doc.cooperationTerms = patch.cooperationTerms;
    if (typeof patch.commissionModel === 'string') doc.commissionModel = patch.commissionModel;
    if (typeof patch.notes === 'string') doc.notes = patch.notes;

    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in updateReferrer:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון מפנה', error: error.message });
  }
};

exports.closeReferrer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'id לא תקין' });
    }

    const doc = await ReferrerPartner.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מפנה לא נמצא' });
    }

    const body = req.body || {};
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    if (status) {
      // סגירה שייכת למצבים הסופיים בלבד, אבל נשאיר גם "active" כדי לסמן "נסגרו תנאים והוא פעיל".
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'סטטוס סגירה לא תקין (רק active/inactive)' });
      }
      doc.status = status;
    } else {
      // ברירת מחדל: פעיל אחרי סגירה
      doc.status = 'active';
    }

    doc.closing = doc.closing || {};
    doc.closing.closedAt = body.closedAt ? new Date(body.closedAt) : new Date();
    if (typeof body.summary === 'string') doc.closing.summary = body.summary;
    if (typeof body.notes === 'string') doc.closing.notes = body.notes;

    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error in closeReferrer:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בסגירת מפנה', error: error.message });
  }
};



