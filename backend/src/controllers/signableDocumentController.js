// backend/src/controllers/signableDocumentController.js
const SignableDocument = require('../models/SignableDocument');
const Client = require('../models/Client');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const SiteSettings = require('../models/SiteSettings');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');

const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

/**
 * Get business defaults from SiteSettings + env vars
 */
async function getBusinessInfo() {
  const settings = await SiteSettings.findOne({ key: 'default' }).lean();
  return {
    name: settings?.company?.name || process.env.BUSINESS_NAME || '',
    address: settings?.contact?.address || process.env.BUSINESS_ADDRESS || '',
    phone: settings?.contact?.phone || process.env.BUSINESS_PHONE || '',
    email: settings?.contact?.email || process.env.BUSINESS_EMAIL || '',
    taxId: process.env.BUSINESS_TAX_ID || '',
    logoUrl: process.env.BUSINESS_LOGO || '',
    letterheadHeaderUrl: settings?.letterhead?.headerImageUrl || '',
    letterheadFooterUrl: settings?.letterhead?.footerImageUrl || ''
  };
}

/**
 * Get client info snapshot
 */
function getClientInfo(client) {
  return {
    name: client.personalInfo?.fullName || '',
    email: client.personalInfo?.email || '',
    phone: client.personalInfo?.phone || '',
    businessName: client.businessInfo?.businessName || ''
  };
}

// ==================== CRUD (Protected) ====================

exports.createSignableDocument = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { title, documentType, content } = req.body;
    const userId = req.user?.id || req.user?._id;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'לקוח לא נמצא' });
    }

    const businessInfo = await getBusinessInfo();
    const clientInfo = getClientInfo(client);

    const doc = new SignableDocument({
      clientId,
      createdBy: isValidObjectId(userId) ? userId : null,
      title: title || 'מסמך לחתימה',
      documentType: documentType || 'contract',
      content: content || '',
      businessInfo,
      clientInfo
    });

    await doc.save();

    res.status(201).json({
      success: true,
      message: 'מסמך נוצר בהצלחה',
      data: doc
    });
  } catch (error) {
    console.error('Create signable document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה ביצירת מסמך', error: error.message });
  }
};

exports.getClientSignableDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;

    const docs = await SignableDocument.find({ clientId })
      .sort({ createdAt: -1 })
      .select('-signatureImageBase64 -accessToken')
      .lean();

    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Get client signable documents error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בטעינת מסמכים', error: error.message });
  }
};

exports.getSignableDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await SignableDocument.findById(docId)
      .select('-signatureImageBase64')
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Get signable document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בטעינת מסמך', error: error.message });
  }
};

exports.updateSignableDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { title, documentType, content } = req.body;

    const doc = await SignableDocument.findById(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    if (doc.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'ניתן לערוך רק מסמכים בסטטוס טיוטה' });
    }

    if (title !== undefined) doc.title = title;
    if (documentType !== undefined) doc.documentType = documentType;
    if (content !== undefined) doc.content = content;

    await doc.save();

    res.json({ success: true, message: 'מסמך עודכן בהצלחה', data: doc });
  } catch (error) {
    console.error('Update signable document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בעדכון מסמך', error: error.message });
  }
};

exports.deleteSignableDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await SignableDocument.findById(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    // Clean up Cloudinary if signed PDF exists
    if (doc.signedPdfCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(doc.signedPdfCloudinaryId, { resource_type: 'raw' });
      } catch (e) {
        console.warn('Failed to delete Cloudinary PDF:', e.message);
      }
    }

    await SignableDocument.findByIdAndDelete(docId);

    res.json({ success: true, message: 'מסמך נמחק בהצלחה' });
  } catch (error) {
    console.error('Delete signable document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה במחיקת מסמך', error: error.message });
  }
};

// ==================== Send Document ====================

exports.sendDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { sendVia, email, phone } = req.body;

    const doc = await SignableDocument.findById(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    if (doc.status === 'signed') {
      return res.status(400).json({ success: false, message: 'מסמך זה כבר נחתם' });
    }

    // Generate JWT access token (30 days)
    const token = jwt.sign(
      { documentId: doc._id.toString(), type: 'sign' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    doc.accessToken = token;
    doc.tokenExpiresAt = tokenExpiresAt;
    doc.sentVia = sendVia || ['email'];
    doc.sentAt = new Date();
    doc.status = 'sent';

    await doc.save();

    const signingUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/sign/${token}`;
    const clientName = doc.clientInfo?.name || 'לקוח יקר';
    const expiryDate = tokenExpiresAt.toLocaleDateString('he-IL');

    // Send via email
    if (sendVia?.includes('email') && (email || doc.clientInfo?.email)) {
      const targetEmail = email || doc.clientInfo.email;
      const emailHtml = buildSigningEmailHtml(clientName, doc.title, doc.documentNumber, signingUrl, expiryDate, doc.businessInfo?.name);

      await emailService.sendEmail(
        targetEmail,
        `${doc.businessInfo?.name || 'BizFlow'} - מסמך לחתימה דיגיטלית: ${doc.title}`,
        emailHtml
      );
    }

    // Send via WhatsApp
    if (sendVia?.includes('whatsapp') && (phone || doc.clientInfo?.phone)) {
      const targetPhone = phone || doc.clientInfo.phone;
      try {
        const whatsappService = require('../services/whatsappService');
        const message = `שלום ${clientName},\n\nקיבלת מסמך לחתימה דיגיטלית: "${doc.title}"\n\nלצפייה וחתימה על המסמך, לחץ על הקישור:\n${signingUrl}\n\nהמסמך תקף עד ${expiryDate}.\n\nבברכה,\n${doc.businessInfo?.name || 'BizFlow'}`;
        await whatsappService.sendMessage(targetPhone, message);
      } catch (waErr) {
        console.warn('WhatsApp send failed (continuing):', waErr.message);
      }
    }

    res.json({
      success: true,
      message: 'מסמך נשלח בהצלחה',
      data: {
        signingUrl,
        sentVia: doc.sentVia,
        tokenExpiresAt: doc.tokenExpiresAt
      }
    });
  } catch (error) {
    console.error('Send document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בשליחת מסמך', error: error.message });
  }
};

// ==================== Preview PDF (Admin) ====================

exports.generatePreviewPDF = async (req, res) => {
  try {
    const { docId } = req.params;

    const doc = await SignableDocument.findById(docId).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    const pdfBuffer = await pdfService.generateSignedDocumentPDF({
      ...doc,
      signatureImageBase64: null,
      signerName: null,
      signedAt: null,
      signerIp: null
    });

    const base64 = pdfBuffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64}`;

    res.json({
      success: true,
      data: { pdfUrl: pdfDataUrl }
    });
  } catch (error) {
    console.error('Generate preview PDF error:', error);
    res.status(500).json({ success: false, message: 'שגיאה ביצירת תצוגה מקדימה', error: error.message });
  }
};

// ==================== Public Endpoints (No Auth) ====================

exports.getPublicDocument = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'קישור לא תקף או שפג תוקפו' });
    }

    if (payload.type !== 'sign') {
      return res.status(401).json({ success: false, message: 'קישור לא תקף' });
    }

    const doc = await SignableDocument.findById(payload.documentId)
      .select('-signatureImageBase64 -accessToken')
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    if (doc.status === 'expired') {
      return res.status(410).json({ success: false, message: 'תוקף המסמך פג' });
    }

    // Mark as viewed if first time
    if (doc.status === 'sent') {
      await SignableDocument.findByIdAndUpdate(doc._id, {
        status: 'viewed',
        viewedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        _id: doc._id,
        documentNumber: doc.documentNumber,
        title: doc.title,
        documentType: doc.documentType,
        content: doc.content,
        businessInfo: doc.businessInfo,
        clientInfo: doc.clientInfo,
        status: doc.status === 'sent' ? 'viewed' : doc.status,
        createdAt: doc.createdAt,
        signedAt: doc.signedAt
      }
    });
  } catch (error) {
    console.error('Get public document error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בטעינת מסמך', error: error.message });
  }
};

exports.submitSignature = async (req, res) => {
  try {
    const { token } = req.params;
    const { signerName, signatureImageBase64 } = req.body;

    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, message: 'קישור לא תקף או שפג תוקפו' });
    }

    if (payload.type !== 'sign') {
      return res.status(401).json({ success: false, message: 'קישור לא תקף' });
    }

    // Validate input
    if (!signerName || !signerName.trim()) {
      return res.status(400).json({ success: false, message: 'נא להזין שם החותם' });
    }

    if (!signatureImageBase64 || !signatureImageBase64.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ success: false, message: 'חתימה לא תקינה' });
    }

    const doc = await SignableDocument.findById(payload.documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'מסמך לא נמצא' });
    }

    if (doc.status === 'signed') {
      return res.status(400).json({ success: false, message: 'מסמך זה כבר נחתם' });
    }

    if (doc.status === 'expired') {
      return res.status(410).json({ success: false, message: 'תוקף המסמך פג' });
    }

    const signerIp = req.ip || req.connection?.remoteAddress || '';
    const signedAt = new Date();

    // Generate signed PDF
    const pdfBuffer = await pdfService.generateSignedDocumentPDF({
      ...doc.toObject(),
      signerName: signerName.trim(),
      signedAt,
      signatureImageBase64,
      signerIp
    });

    // Upload to Cloudinary
    let pdfCloudinaryId = null;
    let pdfCloudinaryUrl = null;

    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinaryConfig) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'tailorbiz/signed-documents',
              resource_type: 'raw',
              public_id: `signed-${doc.documentNumber}`,
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
        console.error('Cloudinary upload failed:', uploadError.message);
      }
    }

    const base64 = pdfBuffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64}`;
    const finalPdfUrl = pdfCloudinaryUrl || pdfDataUrl;

    // Create Document record for the client's documents tab
    const documentRecord = await Document.create({
      clientId: doc.clientId,
      uploadedBy: doc.createdBy,
      fileName: `מסמך חתום ${doc.documentNumber}.pdf`,
      originalName: `signed-${doc.documentNumber}.pdf`,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: pdfBuffer.length,
      cloudinaryId: pdfCloudinaryId,
      cloudinaryUrl: finalPdfUrl,
      resourceType: 'raw',
      category: 'signed_document',
      description: `${doc.title} - נחתם ע"י ${signerName.trim()} בתאריך ${signedAt.toLocaleDateString('he-IL')}`,
      relatedSignableDocumentId: doc._id
    });

    // Update signable document
    doc.status = 'signed';
    doc.signedAt = signedAt;
    doc.signerName = signerName.trim();
    doc.signerIp = signerIp;
    doc.signatureImageBase64 = signatureImageBase64;
    doc.signedPdfUrl = finalPdfUrl;
    doc.signedPdfCloudinaryId = pdfCloudinaryId;
    doc.relatedDocumentId = documentRecord._id;

    await doc.save();

    // Send notification to all admin users
    try {
      const admins = await User.find({
        role: { $in: ['admin', 'super_admin'] },
        isActive: true
      }).select('_id').lean();

      const notifications = admins.map(admin => ({
        type: 'document_signed',
        title: 'מסמך נחתם דיגיטלית',
        message: `${doc.clientInfo?.name || 'לקוח'} חתם על "${doc.title}" (${doc.documentNumber})`,
        userId: admin._id,
        relatedClient: doc.clientId,
        priority: 'high',
        actionUrl: `/admin/clients/${doc.clientId}?tab=sign-docs`,
        actionText: 'צפה במסמך',
        icon: 'draw',
        color: '#4caf50'
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.warn('Failed to create notifications:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'המסמך נחתם בהצלחה! תודה רבה.',
      data: {
        signedAt,
        documentNumber: doc.documentNumber
      }
    });
  } catch (error) {
    console.error('Submit signature error:', error);
    res.status(500).json({ success: false, message: 'שגיאה בשמירת החתימה', error: error.message });
  }
};

// ==================== Helpers ====================

function buildSigningEmailHtml(clientName, docTitle, docNumber, signingUrl, expiryDate, businessName) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a237e, #283593); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 30px; }
    .greeting { font-size: 16px; margin-bottom: 16px; }
    .doc-info { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0; border-right: 4px solid #1a237e; }
    .doc-info p { margin: 6px 0; font-size: 14px; color: #555; }
    .doc-info strong { color: #333; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { display: inline-block; background: #1a237e; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; }
    .expiry { text-align: center; font-size: 12px; color: #999; margin-top: 10px; }
    .footer { padding: 20px 30px; background: #fafafa; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHtmlSimple(businessName || 'BizFlow')}</h1>
      <p>מסמך לחתימה דיגיטלית</p>
    </div>
    <div class="body">
      <p class="greeting">שלום ${escapeHtmlSimple(clientName)},</p>
      <p>קיבלת מסמך לחתימה דיגיטלית. לחץ על הכפתור למטה כדי לצפות במסמך ולחתום עליו.</p>

      <div class="doc-info">
        <p><strong>שם המסמך:</strong> ${escapeHtmlSimple(docTitle)}</p>
        <p><strong>מספר מסמך:</strong> ${escapeHtmlSimple(docNumber)}</p>
      </div>

      <div class="cta">
        <a href="${escapeHtmlSimple(signingUrl)}">צפה וחתום על המסמך</a>
      </div>
      <p class="expiry">הקישור תקף עד ${escapeHtmlSimple(expiryDate)}</p>
    </div>
    <div class="footer">
      <p>הודעה זו נשלחה באמצעות מערכת ${escapeHtmlSimple(businessName || 'BizFlow')}</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtmlSimple(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
