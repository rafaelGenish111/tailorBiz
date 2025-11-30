const multer = require('multer');
const path = require('path');
const fs = require('fs');

const IS_VERCEL = process.env.VERCEL === '1';

// ב-Vercel נשתמש ב-memory storage (ואז נעלה ל-Cloudinary)
// בלוקאל נשתמש ב-disk storage
let storage;

if (IS_VERCEL) {
  // Memory storage for Vercel (serverless - no filesystem write access)
  storage = multer.memoryStorage();
} else {
  // Disk storage for local development
  const uploadDir = 'uploads/contracts';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || 
    file.mimetype === 'application/pdf' || 
    file.mimetype === 'application/msword' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('קבצים מותרים: PDF, Word, ותמונות'));
  }
};

// Create multer upload middleware
const uploadContract = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = uploadContract;
