// backend/controllers/quoteController.js
const Quote = require('../models/Quote');
const Client = require('../models/Client');
const Document = require('../models/Document');
const PDFDocument = require('pdfkit');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

const getBusinessDefaults = () => ({
  name: process.env.BUSINESS_NAME || 'TailorBiz',
  logo: process.env.BUSINESS_LOGO || '',
  address: process.env.BUSINESS_ADDRESS || '',
  phone: process.env.BUSINESS_PHONE || '',
  email: process.env.BUSINESS_EMAIL || '',
  website: process.env.BUSINESS_WEBSITE || '',
  taxId: process.env.BUSINESS_TAX_ID || ''
});

// יצירת הצעת מחיר חדשה
exports.createQuote = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { items, notes, terms, validUntil, includeVat, discount, discountType, title, businessInfo } = req.body;

    const userId = req.user?.id || req.user?._id;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const quote = new Quote({
      clientId,
      createdBy: isValidObjectId(userId) ? userId : null,
      businessInfo: businessInfo || getBusinessDefaults(),
      clientInfo: {
        name: client.personalInfo?.fullName,
        businessName: client.businessInfo?.businessName,
        address: client.personalInfo?.address || client.businessInfo?.address,
        phone: client.personalInfo?.phone,
        email: client.personalInfo?.email,
        taxId: client.businessInfo?.taxId
      },
      title: title || 'הצעת מחיר',
      items: items || [],
      includeVat: includeVat !== false,
      discount: discount || 0,
      discountType: discountType || 'fixed',
      notes,
      terms,
      validUntil
    });

    quote.calculateTotals();
    await quote.save();

    res.status(201).json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת הצעת מחיר',
      error: error.message
    });
  }
};

// עדכון הצעת מחיר
exports.updateQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const updates = req.body;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        quote[key] = updates[key];
      }
    });

    quote.calculateTotals();
    await quote.save();

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון הצעת מחיר',
      error: error.message
    });
  }
};

// קבלת הצעות מחיר של לקוח
exports.getClientQuotes = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { clientId };
    if (status) query.status = status;

    const quotes = await Quote.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Quote.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הצעות מחיר',
      error: error.message
    });
  }
};

// קבלת הצעת מחיר בודדת
exports.getQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId)
      .populate('clientId', 'personalInfo businessInfo')
      .populate('createdBy', 'name');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הצעת מחיר',
      error: error.message
    });
  }
};

// יצירת PDF
exports.generatePDF = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    const userId = req.user?.id || req.user?._id;

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `הצעת מחיר ${quote.quoteNumber}`,
        Author: quote.businessInfo?.name
      }
    });

    // נסה להשתמש בגופן עברי אם קיים (כדי למנוע ג'יבריש)
    try {
      const fontPath = path.join(__dirname, '..', 'assets', 'fonts', 'NotoSansHebrew-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        doc.registerFont('hebrew', fontPath);
        doc.font('hebrew');
      }
    } catch (fontError) {
      console.warn('Hebrew font not loaded, using default PDF font:', fontError.message);
    }

    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    // כותרת
    doc.fontSize(24).text(quote.title || 'הצעת מחיר', { align: 'center' });
    doc.fontSize(12).text(`מספר: ${quote.quoteNumber}`, { align: 'center' });
    doc.text(`תאריך: ${new Date(quote.createdAt).toLocaleDateString('he-IL')}`, { align: 'center' });
    doc.moveDown();

    // פרטי עסק
    doc.fontSize(14).text('פרטי העסק:', { underline: true });
    doc.fontSize(10);
    if (quote.businessInfo?.name) doc.text(quote.businessInfo.name);
    if (quote.businessInfo?.address) doc.text(quote.businessInfo.address);
    if (quote.businessInfo?.phone) doc.text(`טלפון: ${quote.businessInfo.phone}`);
    if (quote.businessInfo?.email) doc.text(`אימייל: ${quote.businessInfo.email}`);
    if (quote.businessInfo?.taxId) doc.text(`ח.פ/ע.מ: ${quote.businessInfo.taxId}`);
    doc.moveDown();

    // פרטי לקוח
    doc.fontSize(14).text('פרטי הלקוח:', { underline: true });
    doc.fontSize(10);
    if (quote.clientInfo?.name) doc.text(quote.clientInfo.name);
    if (quote.clientInfo?.businessName) doc.text(quote.clientInfo.businessName);
    if (quote.clientInfo?.address) doc.text(quote.clientInfo.address);
    if (quote.clientInfo?.phone) doc.text(`טלפון: ${quote.clientInfo.phone}`);
    if (quote.clientInfo?.email) doc.text(`אימייל: ${quote.clientInfo.email}`);
    doc.moveDown(2);

    // טבלת פריטים
    doc.fontSize(14).text('פירוט:', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;

    doc.fontSize(10);
    doc.text('מוצר/שירות', 50, tableTop);
    doc.text('תיאור', 150, tableTop);
    doc.text('כמות', 320, tableTop);
    doc.text('מחיר יחידה', 380, tableTop);
    doc.text('סה"כ', 480, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPosition = tableTop + 25;
    quote.items.forEach(item => {
      doc.text(item.name, 50, yPosition, { width: 95 });
      doc.text(item.description || '-', 150, yPosition, { width: 165 });
      doc.text(String(item.quantity), 320, yPosition);
      doc.text(`₪${item.unitPrice.toLocaleString()}`, 380, yPosition);
      doc.text(`₪${item.totalPrice.toLocaleString()}`, 480, yPosition);
      yPosition += 25;
    });

    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 15;

    // סיכומים
    doc.fontSize(11);
    doc.text(`סה"כ לפני מע"מ:`, 380, yPosition);
    doc.text(`₪${quote.subtotal.toLocaleString()}`, 480, yPosition);
    yPosition += 20;

    if (quote.includeVat) {
      doc.text(`מע"מ (${quote.vatRate}%):`, 380, yPosition);
      doc.text(`₪${quote.vatAmount.toLocaleString()}`, 480, yPosition);
      yPosition += 20;
    }

    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('סה"כ לתשלום:', 380, yPosition);
    doc.text(`₪${quote.total.toLocaleString()}`, 480, yPosition);
    doc.font('Helvetica');

    // הערות
    if (quote.notes) {
      doc.moveDown(2);
      doc.fontSize(12).text('הערות:', { underline: true });
      doc.fontSize(10).text(quote.notes);
    }

    // תנאים
    if (quote.terms) {
      doc.moveDown();
      doc.fontSize(12).text('תנאים:', { underline: true });
      doc.fontSize(10).text(quote.terms);
    }

    // תוקף
    if (quote.validUntil) {
      doc.moveDown();
      doc.fontSize(10).text(
        `הצעה זו בתוקף עד: ${new Date(quote.validUntil).toLocaleDateString('he-IL')}`,
        { align: 'center' }
      );
    }

    doc.end();

    await new Promise(resolve => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(buffers);

    // ניצור תמיד data URL לצורך צפייה בצד ה-Frontend
    const base64 = pdfBuffer.toString('base64');
    const pdfUrl = `data:application/pdf;base64,${base64}`;

    // אם Cloudinary מוגדר, נעלה לשם לצורכי אחסון בלבד, אבל לצפייה נמשיך להשתמש ב-data URL
    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;
    
    let pdfCloudinaryId = null;

    if (hasCloudinaryConfig) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `tailorbiz/quotes`,
              resource_type: 'raw',
              public_id: `quote-${quote.quoteNumber}`,
              format: 'pdf'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
        });

        pdfCloudinaryId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload failed (using local data URL for viewing):', uploadError.message);
      }
    }

    quote.pdfUrl = pdfUrl;
    quote.pdfCloudinaryId = pdfCloudinaryId;
    await quote.save();

    // צור גם מסמך בטבלת Documents
    await Document.create({
      clientId: quote.clientId,
      uploadedBy: isValidObjectId(userId) ? userId : null,
      fileName: `הצעת מחיר ${quote.quoteNumber}.pdf`,
      originalName: `quote-${quote.quoteNumber}.pdf`,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: pdfBuffer.length,
      cloudinaryId: pdfCloudinaryId,
      cloudinaryUrl: pdfUrl,
      resourceType: 'raw',
      category: 'quote',
      description: `הצעת מחיר ${quote.quoteNumber} ללקוח ${quote.clientInfo?.name}`,
      relatedQuoteId: quote._id
    });

    res.json({
      success: true,
      message: 'PDF נוצר בהצלחה',
      data: {
        pdfUrl,
        quote
      }
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת PDF',
      error: error.message
    });
  }
};

// העלאת קובץ PDF חיצוני להצעת מחיר
exports.uploadExternalPDF = async (req, res) => {
  try {
    const { quoteId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'לא התקבל קובץ PDF'
      });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    const userId = req.user?.id || req.user?._id;

    // הקובץ נשמר בתיקיית uploads/quotes, נחשף דרך /uploads בצד השרת
    const pdfUrl = `/uploads/quotes/${req.file.filename}`;

    quote.pdfUrl = pdfUrl;
    quote.pdfCloudinaryId = null;
    await quote.save();

    // צור גם רשומה בטבלת Documents לצורך ניהול מסמכים מרכזי
    await Document.create({
      clientId: quote.clientId,
      uploadedBy: isValidObjectId(userId) ? userId : null,
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileType: 'pdf',
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryId: null,
      cloudinaryUrl: pdfUrl,
      resourceType: 'raw',
      category: 'quote',
      description: `קובץ PDF שהועלה ידנית להצעת מחיר ${quote.quoteNumber}`,
      relatedQuoteId: quote._id
    });

    res.json({
      success: true,
      message: 'קובץ PDF הועלה ונקשר להצעת המחיר',
      data: {
        pdfUrl,
        quote
      }
    });
  } catch (error) {
    console.error('Upload external PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהעלאת קובץ PDF',
      error: error.message
    });
  }
};

// מחיקת הצעת מחיר
exports.deleteQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findByIdAndDelete(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    if (quote.pdfCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(quote.pdfCloudinaryId, { resource_type: 'raw' });
      } catch (e) {
        console.error('Error deleting PDF from cloudinary:', e);
      }
    }

    res.json({
      success: true,
      message: 'הצעת המחיר נמחקה'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת הצעת מחיר',
      error: error.message
    });
  }
};

// עדכון סטטוס
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { status } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      quoteId,
      { status },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סטטוס',
      error: error.message
    });
  }
};

// שכפול הצעת מחיר
exports.duplicateQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const original = await Quote.findById(quoteId);
    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    const duplicate = new Quote({
      ...original.toObject(),
      _id: undefined,
      quoteNumber: undefined,
      status: 'draft',
      pdfUrl: undefined,
      pdfCloudinaryId: undefined,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicate.save();

    res.status(201).json({
      success: true,
      data: duplicate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'שגיאה בשכפול הצעת מחיר',
      error: error.message
    });
  }
};

