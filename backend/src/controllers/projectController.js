const Project = require('../models/Project');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getProjects = async (req, res) => {
  try {
    const { clientId } = req.query;
    const filter = {};
    if (clientId && isValidObjectId(clientId)) {
      filter.clientId = clientId;
    }
    const projects = await Project.find(filter)
      .populate('clientId', 'personalInfo businessInfo')
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: projects });
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת פרויקטים',
      error: error.message
    });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'מזהה פרויקט לא תקין' });
    }
    const project = await Project.findById(id).populate('clientId', 'personalInfo businessInfo').lean();
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    return res.json({ success: true, data: project });
  } catch (error) {
    console.error('getProjectById error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הפרויקט',
      error: error.message
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const data = req.body;
    const project = await Project.create(data);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת פרויקט',
      error: error.message
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'מזהה פרויקט לא תקין' });
    }
    const project = await Project.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    return res.json({ success: true, data: project });
  } catch (error) {
    console.error('updateProject error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון הפרויקט',
      error: error.message
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'מזהה פרויקט לא תקין' });
    }
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    return res.json({ success: true, message: 'הפרויקט נמחק' });
  } catch (error) {
    console.error('deleteProject error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת הפרויקט',
      error: error.message
    });
  }
};

exports.addRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const requirementData = req.body;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'מזהה פרויקט לא תקין' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    if (!project.requirements) project.requirements = [];
    project.requirements.push(requirementData);
    await project.save();
    const added = project.requirements[project.requirements.length - 1];
    return res.status(201).json({ success: true, data: added });
  } catch (error) {
    console.error('addRequirement error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בהוספת דרישה',
      error: error.message
    });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id, requirementId } = req.params;
    const updates = req.body;
    if (!isValidObjectId(id) || !isValidObjectId(requirementId)) {
      return res.status(400).json({ success: false, message: 'מזהה לא תקין' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    const reqDoc = project.requirements.id(requirementId);
    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'דרישה לא נמצאה' });
    }
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) reqDoc[key] = updates[key];
    });
    await project.save();
    return res.json({ success: true, data: reqDoc });
  } catch (error) {
    console.error('updateRequirement error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון דרישה',
      error: error.message
    });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    const { id, requirementId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(requirementId)) {
      return res.status(400).json({ success: false, message: 'מזהה לא תקין' });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    }
    project.requirements.pull(requirementId);
    await project.save();
    return res.json({ success: true, message: 'הדרישה נמחקה' });
  } catch (error) {
    console.error('deleteRequirement error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת דרישה',
      error: error.message
    });
  }
};
