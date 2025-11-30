const Project = require('../models/Project');
const TaskManager = require('../models/TaskManager');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// יצירת פרויקט חדש
exports.createProject = async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.user?._id;

    const data = {
      ...req.body,
      ownerId: isValidObjectId(rawUserId) ? rawUserId : null
    };

    const project = await Project.create(data);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת פרויקט',
      error: error.message
    });
  }
};

// עדכון פרויקט
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(projectId, updates, {
      new: true
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'פרויקט לא נמצא'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון פרויקט',
      error: error.message
    });
  }
};

// מחיקת פרויקט (לא מוחק משימות, רק מנתק אותן מהפרויקט)
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'פרויקט לא נמצא'
      });
    }

    // ננתק משימות מהפרויקט אך לא נמחק אותן
    await TaskManager.updateMany(
      { projectId },
      { $unset: { projectId: '' } }
    );

    res.json({
      success: true,
      message: 'הפרויקט נמחק, והמשימות נותקו ממנו'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת פרויקט',
      error: error.message
    });
  }
};

// פרויקט יחיד
exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'פרויקט לא נמצא'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת פרויקט',
      error: error.message
    });
  }
};

// רשימת פרויקטים עם פילטרים
exports.getProjects = async (req, res) => {
  try {
    const { status, clientId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    // בשלב זה, כדי להימנע מבעיות עם temp-user-id / פיתוח – נציג את כל הפרויקטים התואמים לפילטרים,
    // בלי סינון לפי ownerId. בהמשך אפשר להחזיר סינון לפי משתמש כאשר מנגנון ה-auth יהיה יציב.

    const projects = await Project.find(query).sort('-createdAt');

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת רשימת פרויקטים',
      error: error.message
    });
  }
};


