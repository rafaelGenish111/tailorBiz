const HuntingPool = require('../models/HuntingPool');

// יצירת Pool חדש (סקטור)
exports.createPool = async (req, res) => {
  try {
    const { sectorName, description } = req.body || {};

    if (!sectorName || !String(sectorName).trim()) {
      return res.status(400).json({ success: false, message: 'sectorName הוא שדה חובה' });
    }

    const pool = await HuntingPool.create({
      sectorName: String(sectorName).trim(),
      description: description ? String(description) : '',
      prospects: [],
    });

    return res.status(201).json({ success: true, data: pool });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'סקטור כזה כבר קיים' });
    }
    console.error('Error in createPool:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת Pool', error: error.message });
  }
};

// קבלת כל ה-Pools
exports.getPools = async (req, res) => {
  try {
    const pools = await HuntingPool.find()
      .sort({ sectorName: 1 })
      .select('-__v');

    return res.json({ success: true, data: pools });
  } catch (error) {
    console.error('Error in getPools:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת Pools', error: error.message });
  }
};

// הוספת Prospect ל-Pool
exports.addProspectToPool = async (req, res) => {
  try {
    const { poolId } = req.params;
    const { companyName, contactPerson, phone, notes } = req.body || {};

    if (!companyName || !String(companyName).trim()) {
      return res.status(400).json({ success: false, message: 'companyName הוא שדה חובה' });
    }

    const pool = await HuntingPool.findById(poolId);
    if (!pool) {
      return res.status(404).json({ success: false, message: 'Pool לא נמצא' });
    }

    pool.prospects.unshift({
      companyName: String(companyName).trim(),
      contactPerson: contactPerson ? String(contactPerson).trim() : '',
      phone: phone ? String(phone).trim() : '',
      notes: notes ? String(notes) : '',
      status: 'pending',
    });

    await pool.save();

    return res.status(201).json({ success: true, data: pool });
  } catch (error) {
    console.error('Error in addProspectToPool:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהוספת Prospect', error: error.message });
  }
};

// עדכון סטטוס / פרטים של Prospect
exports.updateProspectStatus = async (req, res) => {
  try {
    const { poolId, prospectId } = req.params;
    const { status, companyName, contactPerson, phone, notes } = req.body || {};

    const pool = await HuntingPool.findById(poolId);
    if (!pool) {
      return res.status(404).json({ success: false, message: 'Pool לא נמצא' });
    }

    const prospect = pool.prospects.id(prospectId);
    if (!prospect) {
      return res.status(404).json({ success: false, message: 'Prospect לא נמצא' });
    }

    if (typeof status === 'string' && status.trim()) {
      prospect.status = status.trim();
    }
    if (typeof companyName === 'string') prospect.companyName = companyName;
    if (typeof contactPerson === 'string') prospect.contactPerson = contactPerson;
    if (typeof phone === 'string') prospect.phone = phone;
    if (typeof notes === 'string') prospect.notes = notes;

    await pool.save();

    return res.json({ success: true, data: pool });
  } catch (error) {
    console.error('Error in updateProspectStatus:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון Prospect', error: error.message });
  }
};

exports.addFromExtension = async (req, res) => {
  try {
    const { name, platform, profileUrl, description, metadata } = req.body;
    
    // בדיקה אם קיים
    const existing = await HuntingPool.findOne({ profileUrl });
    if (existing) {
      return res.status(200).json({ message: 'הליד כבר קיים במאגר' });
    }

    const newLead = await HuntingPool.create({
      name,
      platform,
      profileUrl,
      description,
      status: 'new',
      metadata
    });

    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... (הפונקציות הקיימות נשארות)

// פונקציה חדשה לטיפול בתוסף הכרום
exports.addFromExtension = async (req, res) => {
  try {
    console.log('📥 Received lead from extension:', req.body);
    
    const { name, platform, profileUrl, description, metadata } = req.body;

    // 1. מציאת או יצירת Pool ברירת מחדל ללינקדאין
    const defaultSectorName = 'LinkedIn Imports';
    let pool = await HuntingPool.findOne({ sectorName: defaultSectorName });

    if (!pool) {
      pool = await HuntingPool.create({
        sectorName: defaultSectorName,
        description: 'לידים שיובאו אוטומטית מתוסף הכרום'
      });
      console.log('✨ Created new pool:', defaultSectorName);
    }

    // 2. בדיקה אם הליד כבר קיים ב-Pool הזה (לפי URL)
    const existingProspect = pool.prospects.find(p => p.profileUrl === profileUrl);
    if (existingProspect) {
      return res.status(200).json({ 
        success: true, 
        message: 'הליד כבר קיים במערכת', 
        exists: true 
      });
    }

    // 3. הוספת הליד
    pool.prospects.unshift({
      contactPerson: name, // שם הליד
      companyName: metadata?.role || description || 'Unknown', // תפקיד/חברה
      platform: platform || 'linkedin',
      profileUrl: profileUrl,
      notes: description, // תיאור כללי
      status: 'new',
      metadata: metadata || {}
    });

    await pool.save();

    return res.status(201).json({ success: true, message: 'הליד נשמר בהצלחה', data: pool });

  } catch (error) {
    console.error('❌ Error in addFromExtension:', error);
    return res.status(500).json({ success: false, message: 'שגיאת שרת בשמירת הליד', error: error.message });
  }
};