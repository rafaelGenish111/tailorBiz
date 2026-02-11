// backend/controllers/quoteController.js
const Quote = require('../models/Quote');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Document = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
const fs = require('fs');
const pdfService = require('../services/pdfService');

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

// יצירת PDF - משתמש ב-pdfService (Puppeteer HTML-to-PDF) עם RTL ועברית
exports.generatePDF = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findById(quoteId).lean();
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'הצעת מחיר לא נמצאה'
      });
    }

    // מיפוי מפורש מ-quote.items - unitPrice ו-totalPrice מההצעה (לא מ-requirements)
    const pdfData = {
      ...quote,
      items: (quote.items || []).map((item) => ({
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity) ?? 1,
        unitPrice: Number(item.unitPrice) ?? 0,
        totalPrice: Number(item.totalPrice) ?? (Number(item.unitPrice) ?? 0) * (Number(item.quantity) ?? 1)
      }))
    };

    if (process.env.NODE_ENV !== 'production' && pdfData.items.length > 0) {
      console.log('[Quote PDF] items for', quote.quoteNumber, ':', JSON.stringify(pdfData.items.map((i) => ({ name: i.name, unitPrice: i.unitPrice, totalPrice: i.totalPrice }))));
    }

    const userId = req.user?.id || req.user?._id;

    const pdfBuffer = await pdfService.generateQuotePDF(pdfData);

    // ניצור תמיד data URL לצורך תצוגה מקדימה בצד ה-Frontend
    const base64 = pdfBuffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64}`;

    // נתוני Cloudinary (לשימוש באחסון בלבד, לא לתצוגה)
    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    let pdfCloudinaryId = null;
    let pdfCloudinaryUrl = null;

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
        pdfCloudinaryUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed (using data URL for preview):', uploadError.message);
      }
    }

    // לתצוגה מקדימה ב-Frontend נשתמש תמיד ב-data URL
    await Quote.findByIdAndUpdate(quoteId, {
      pdfUrl: pdfDataUrl,
      pdfCloudinaryId: pdfCloudinaryId || undefined
    });

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
      cloudinaryUrl: pdfCloudinaryUrl || pdfDataUrl,
      resourceType: 'raw',
      category: 'quote',
      description: `הצעת מחיר ${quote.quoteNumber} ללקוח ${quote.clientInfo?.name}`,
      relatedQuoteId: quote._id
    });

    res.json({
      success: true,
      message: 'PDF נוצר בהצלחה',
      data: {
        pdfUrl: pdfDataUrl,
        quote: { ...quote, pdfUrl: pdfDataUrl, pdfCloudinaryId: pdfCloudinaryId }
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
    const IS_VERCEL = process.env.VERCEL === '1';

    // נבנה data URL מהקובץ לצורך תצוגה מקדימה ב-Frontend
    let previewDataUrl = null;
    try {
      let buffer;
      if (req.file.buffer) {
        buffer = req.file.buffer;
      } else if (req.file.path) {
        buffer = fs.readFileSync(req.file.path);
      }
      if (buffer) {
        const base64 = buffer.toString('base64');
        previewDataUrl = `data:application/pdf;base64,${base64}`;
      }
    } catch (e) {
      console.error('Failed to build data URL for uploaded PDF:', e.message);
    }

    let pdfStorageUrl = null;
    let pdfCloudinaryId = null;

    // ב-Vercel (serverless) אין גישה לדיסק, צריך להעלות ל-Cloudinary
    // או אם req.file.filename לא קיים (memory storage)
    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (IS_VERCEL || !req.file.filename) {
      if (hasCloudinaryConfig) {
        try {
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `tailorbiz/quotes`,
                resource_type: 'raw',
                public_id: `quote-${quoteId}-${Date.now()}`
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
          });

          pdfStorageUrl = uploadResult.secure_url;
          pdfCloudinaryId = uploadResult.public_id;
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError.message);
          return res.status(500).json({
            success: false,
            message: 'שגיאה בהעלאת קובץ PDF ל-Cloudinary',
            error: uploadError.message
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary לא מוגדר - לא ניתן להעלות קבצים ב-Vercel'
        });
      }
    } else {
      // בסביבת פיתוח מקומית - שמור בדיסק
      pdfStorageUrl = `/uploads/quotes/${req.file.filename}`;
    }

    // לתצוגה מקדימה נשתמש ב-data URL, ואם לא הצלחנו לבנות אותו – נ fallback ל-URL האחסון
    const pdfUrlForPreview = previewDataUrl || pdfStorageUrl;

    quote.pdfUrl = pdfUrlForPreview;
    quote.pdfCloudinaryId = pdfCloudinaryId;
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
      cloudinaryId: pdfCloudinaryId,
      cloudinaryUrl: pdfStorageUrl || pdfUrlForPreview,
      resourceType: 'raw',
      category: 'quote',
      description: `קובץ PDF שהועלה ידנית להצעת מחיר ${quote.quoteNumber}`,
      relatedQuoteId: quote._id
    });

    res.json({
      success: true,
      message: 'קובץ PDF הועלה ונקשר להצעת המחיר',
      data: {
        pdfUrl: pdfUrlForPreview,
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

/**
 * Generate Quote from Project approved requirements
 * Maps Project.requirements (status=approved) to Quote items as placeholders for pricing.
 * User can send requirementIds in body to override which requirements to include.
 */
exports.generateFromProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { requirementIds } = req.body || {};

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'מזהה פרויקט לא תקין'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'פרויקט לא נמצא'
      });
    }

    const clientId = project.clientId;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'לפרויקט אין לקוח משויך'
      });
    }

    // Resolve Client for clientInfo (in case clientId is ObjectId, not populated)
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח הפרויקט לא נמצא'
      });
    }

    let requirementsToInclude = [];

    if (requirementIds && Array.isArray(requirementIds) && requirementIds.length > 0) {
      // User explicitly selected requirement IDs
      const validIds = requirementIds.filter((id) => isValidObjectId(id));
      requirementsToInclude = (project.requirements || []).filter((r) =>
        validIds.some((id) => r._id.toString() === id.toString())
      );
    } else {
      // Default: only approved requirements
      requirementsToInclude = (project.requirements || []).filter(
        (r) => r.status === 'approved'
      );
    }

    if (requirementsToInclude.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'אין דרישות מאושרות לבחירה. אנא אשר דרישות בפרויקט או שלח מזהה דרישות ספציפיות.'
      });
    }

    // Map requirements to quote items
    // Use global hourly rate if available (HOURLY_RATE_ILS env), else placeholder 0 for user to edit
    const hourlyRate = parseFloat(process.env.HOURLY_RATE_ILS) || 0;
    const items = requirementsToInclude.map((req) => {
      const quantity = 1;
      const unitPrice =
        hourlyRate > 0 && req.estimatedHours > 0
          ? req.estimatedHours * hourlyRate
          : 0;
      return {
        name: req.title,
        description: req.description || '',
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      };
    });

    const nextVersion =
      (await Quote.findOne({ projectId }).sort({ version: -1 }).select('version').lean())
        ?.version ?? 0;
    const version = nextVersion + 1;

    const quote = new Quote({
      clientId,
      projectId: project._id,
      version,
      linkedRequirements: requirementsToInclude.map((r) => r._id),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : req.user?._id || null,
      businessInfo: getBusinessDefaults(),
      clientInfo: {
        name: client.personalInfo?.fullName,
        businessName: client.businessInfo?.businessName,
        address: client.personalInfo?.address || client.businessInfo?.address,
        phone: client.personalInfo?.phone,
        email: client.personalInfo?.email,
        taxId: client.businessInfo?.taxId
      },
      title: `הצעת מחיר - ${project.name}`,
      items,
      status: 'draft'
    });

    quote.calculateTotals();
    await quote.save();

    res.status(201).json({
      success: true,
      message: 'הצעת מחיר נוצרה מהפרויקט',
      data: quote
    });
  } catch (error) {
    console.error('Generate from project error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת הצעת מחיר מהפרויקט',
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

