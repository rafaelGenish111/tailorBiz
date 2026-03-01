const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const mongoose = require('mongoose');
const notionSyncService = require('../services/notionSyncService');

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const data = req.body;
    const project = await Project.create(data);
    notionSyncService.syncProject(project._id.toString());
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת פרויקט',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
    notionSyncService.syncProject(id);
    return res.json({ success: true, data: project });
  } catch (error) {
    console.error('updateProject error:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון הפרויקט',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// ============ Contract ============

exports.getContract = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('contract').lean();
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    return res.json({ success: true, data: project.contract || {} });
  } catch (error) {
    console.error('getContract error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת חוזה' });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    Object.assign(project.contract, req.body);
    await project.save();
    notionSyncService.syncProject(id);
    return res.json({ success: true, data: project.contract });
  } catch (error) {
    console.error('updateContract error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון חוזה' });
  }
};

// ============ Payment Plan ============

exports.updatePaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    project.paymentPlan = req.body;
    await project.save();
    notionSyncService.syncProject(id);
    return res.json({ success: true, data: project.paymentPlan });
  } catch (error) {
    console.error('updatePaymentPlan error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון תוכנית תשלום' });
  }
};

exports.updateInstallment = async (req, res) => {
  try {
    const { id, installmentId } = req.params;
    const updates = req.body;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    if (!project.paymentPlan || !project.paymentPlan.installments) {
      return res.status(404).json({ success: false, message: 'תוכנית תשלום לא נמצאה' });
    }
    const installment = project.paymentPlan.installments.id(installmentId);
    if (!installment) return res.status(404).json({ success: false, message: 'תשלום לא נמצא' });
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) installment[key] = updates[key];
    });
    // Update financials
    const paid = project.paymentPlan.installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    project.financials.paidAmount = paid;
    project.financials.balance = (project.financials.totalValue || 0) - paid;
    await project.save();
    notionSyncService.syncProject(id);
    return res.json({ success: true, data: installment });
  } catch (error) {
    console.error('updateInstallment error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון תשלום' });
  }
};

// ============ Interactions ============

exports.getInteractions = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('interactions').lean();
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    return res.json({ success: true, data: project.interactions || [] });
  } catch (error) {
    console.error('getInteractions error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת אינטראקציות' });
  }
};

exports.addInteraction = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    project.interactions.push({ ...req.body, createdBy: req.user?._id });
    await project.save();
    const added = project.interactions[project.interactions.length - 1];
    return res.status(201).json({ success: true, data: added });
  } catch (error) {
    console.error('addInteraction error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהוספת אינטראקציה' });
  }
};

exports.updateInteraction = async (req, res) => {
  try {
    const { id, interactionId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    const interaction = project.interactions.id(interactionId);
    if (!interaction) return res.status(404).json({ success: false, message: 'אינטראקציה לא נמצאה' });
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) interaction[key] = req.body[key];
    });
    await project.save();
    return res.json({ success: true, data: interaction });
  } catch (error) {
    console.error('updateInteraction error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון אינטראקציה' });
  }
};

exports.deleteInteraction = async (req, res) => {
  try {
    const { id, interactionId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    project.interactions.pull(interactionId);
    await project.save();
    return res.json({ success: true, message: 'אינטראקציה נמחקה' });
  } catch (error) {
    console.error('deleteInteraction error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקת אינטראקציה' });
  }
};

// ============ Documents ============

exports.getDocuments = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('documents').lean();
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    return res.json({ success: true, data: project.documents || [] });
  } catch (error) {
    console.error('getDocuments error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת מסמכים' });
  }
};

exports.addDocument = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    project.documents.push({ ...req.body, uploadedBy: req.user?._id });
    await project.save();
    const added = project.documents[project.documents.length - 1];
    return res.status(201).json({ success: true, data: added });
  } catch (error) {
    console.error('addDocument error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהוספת מסמך' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    project.documents.pull(documentId);
    await project.save();
    return res.json({ success: true, message: 'מסמך נמחק' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה במחיקת מסמך' });
  }
};

// ============ Progress ============

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'פרויקט לא נמצא' });
    Object.assign(project.progress, req.body);
    await project.save();
    return res.json({ success: true, data: project.progress });
  } catch (error) {
    console.error('updateProgress error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בעדכון התקדמות' });
  }
};

// ============ Invoices (scoped to project) ============

exports.getProjectInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice.find({ projectId: id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('getProjectInvoices error:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בטעינת חשבוניות' });
  }
};
