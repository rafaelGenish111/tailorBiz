const multer = require('multer');
const path = require('path');
const fs = require('fs');

const IS_VERCEL = process.env.VERCEL === '1';

let storage;

if (IS_VERCEL) {
  // Memory storage for Vercel (serverless - no filesystem write access)
  storage = multer.memoryStorage();
} else {
  // Disk storage for local development
  const uploadDir = 'uploads/quotes';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'quote-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

// File filter - allow only PDF
const fileFilter = (req, file, cb) => {
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  const isPdfMime = file.mimetype === 'application/pdf';

  if (isPdfExt || isPdfMime) {
    return cb(null, true);
  } else {
    cb(new Error('רק קבצי PDF מותרים להצעות מחיר'));
  }
};

const uploadQuotePdf = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = uploadQuotePdf;
