// backend/src/controllers/documentController.js
const Document = require('../models/Document');
const { deleteFromCloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

exports.uploadDocument = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category, description, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'לא נבחר קובץ'
      });
    }

    const userId = req.user?.id || req.user?._id;

    const ext = file.originalname.split('.').pop().toLowerCase();
    let fileType = 'other';
    if (ext === 'pdf') fileType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) fileType = 'doc';
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) fileType = 'image';
    else if (['xls', 'xlsx'].includes(ext)) fileType = 'excel';

    const document = await Document.create({
      clientId,
      uploadedBy: isValidObjectId(userId) ? userId : null,
      fileName: file.originalname,
      originalName: file.originalname,
      fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      cloudinaryId: file.filename || file.public_id,
      cloudinaryUrl: file.path || file.secure_url,
      resourceType: file.resource_type || 'raw',
      category: category || 'other',
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    res.status(201).json({
      success: true,
      message: 'הקובץ הועלה בהצלחה',
      data: document
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהעלאת הקובץ',
      error: error.message
    });
  }
};

exports.getClientDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    const query = { clientId, status: 'active' };
    if (category && category !== 'all') {
      query.category = category;
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    // בניית $match בטוח ל-categoryCounts (מגן מפני clientId לא תקין)
    let match = { status: 'active' };
    try {
      if (isValidObjectId(clientId)) {
        match.clientId = new mongoose.Types.ObjectId(clientId);
      } else {
        // אם clientId לא תקין - נחפש על clientId שלא קיים כדי למנוע שגיאה
        match.clientId = new mongoose.Types.ObjectId('000000000000000000000000');
      }
    } catch (e) {
      match.clientId = new mongoose.Types.ObjectId('000000000000000000000000');
    }

    const categoryCounts = await Document.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        documents,
        categoryCounts: categoryCounts.reduce((acc, c) => {
          acc[c._id] = c.count;
          return acc;
        }, {}),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in getClientDocuments:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת המסמכים',
      error: error.message
    });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { category, description, tags, fileName } = req.body;

    const document = await Document.findByIdAndUpdate(
      documentId,
      {
        category,
        description,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
        fileName
      },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'מסמך לא נמצא'
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון המסמך',
      error: error.message
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'מסמך לא נמצא'
      });
    }

    if (document.cloudinaryId) {
      try {
        await deleteFromCloudinary(document.cloudinaryId, document.resourceType);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await Document.findByIdAndDelete(documentId);

    res.json({
      success: true,
      message: 'המסמך נמחק בהצלחה'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת המסמך',
      error: error.message
    });
  }
};

exports.archiveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findByIdAndUpdate(
      documentId,
      { status: 'archived' },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'מסמך לא נמצא'
      });
    }

    res.json({
      success: true,
      message: 'המסמך הועבר לארכיון',
      data: document
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בארכוב המסמך',
      error: error.message
    });
  }
};

