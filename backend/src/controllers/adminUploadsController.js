const fs = require('fs');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'לא נשלח קובץ' });
    }

    const folder = req.body.folder || 'tailorbiz/site';
    const resourceType = 'image';

    let result;
    if (req.file.buffer) {
      result = await uploadBufferToCloudinary(req.file.buffer, {
        folder,
        resource_type: resourceType
      });
    } else if (req.file.path) {
      result = await cloudinary.uploader.upload(req.file.path, {
        folder,
        resource_type: resourceType
      });
      // cleanup local file if any
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {
        // ignore
      }
    } else {
      return res.status(400).json({ success: false, message: 'פורמט קובץ לא נתמך' });
    }

    return res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return res.status(500).json({ success: false, message: 'שגיאה בהעלאת תמונה', error: error.message });
  }
};

// מחזיר חתימה להעלאה ישירה ל-Cloudinary (מונע מגבלות גוף בקשה של Vercel)
exports.getCloudinarySignature = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'חסרה הגדרת Cloudinary בשרת (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)'
      });
    }

    const folder = (req.query.folder || 'tailorbiz/site').toString();
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret
    );

    return res.json({
      success: true,
      data: {
        cloudName,
        apiKey,
        folder,
        timestamp,
        signature
      }
    });
  } catch (error) {
    console.error('Error in getCloudinarySignature:', error);
    return res.status(500).json({ success: false, message: 'שגיאה ביצירת חתימה', error: error.message });
  }
};

