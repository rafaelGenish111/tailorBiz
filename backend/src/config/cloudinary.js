// backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const clientId = req.params.clientId;
    
    let resourceType = 'auto';
    let format;
    
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(ext)) {
      resourceType = 'raw';
      format = 'pdf';
    } else if (['doc', 'docx'].includes(ext)) {
      resourceType = 'raw';
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      resourceType = 'image';
    }

    return {
      folder: `tailorbiz/clients/${clientId}/documents`,
      resource_type: resourceType,
      format: format,
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xlsx', 'xls']
    };
  }
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('סוג קובץ לא נתמך'), false);
    }
  }
});

const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadDocument,
  deleteFromCloudinary
};
















