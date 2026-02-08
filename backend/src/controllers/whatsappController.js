const Client = require('../models/Client');
const whatsappService = require('../services/whatsappService');
const leadNurturingService = require('../services/leadServiceV2');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// טיפול בהודעות נכנסות (Webhook)
exports.handleWebhook = async (req, res) => {
  try {
    const { from, body, timestamp, messageId } = req.body;

    console.log('Received WhatsApp message:', { from, body });

    // חיפוש לקוח קיים
    let client = await Client.findOne({
      $or: [
        { 'personalInfo.whatsappPhone': from },
        { 'personalInfo.phone': from }
      ]
    });

    if (!client) {
      // יצירת ליד חדש אוטומטית
      client = new Client({
        personalInfo: {
          fullName: 'ליד חדש מ-WhatsApp',
          phone: from,
          whatsappPhone: from,
          preferredContactMethod: 'whatsapp'
        },
        businessInfo: {
          businessName: 'ממתין למידע'
        },
        status: 'new_lead',
        leadSource: 'whatsapp',
        interactions: [{
          type: 'whatsapp',
          direction: 'inbound',
          subject: 'הודעה ראשונה',
          content: body,
          timestamp: new Date(timestamp)
        }],
        whatsappConversations: [{
          conversationId: messageId,
          lastMessageDate: new Date(timestamp),
          lastMessagePreview: body.substring(0, 100),
          lastMessageFrom: 'client',
          unreadCount: 1
        }]
      });

      await client.save();

      // התראה על ליד חדש
      console.log(`🆕 ליד חדש מ-WhatsApp: ${from}`);

    } else {
      // הוספת אינטראקציה ללקוח קיים
      client.interactions.push({
        type: 'whatsapp',
        direction: 'inbound',
        subject: 'הודעת WhatsApp',
        content: body,
        timestamp: new Date(timestamp)
      });

      await client.save();

      // בדוק אם צריך לעצור רצפי טיפוח פעילים (רק עבור אינטראקציות inbound)
      if (process.env.ENABLE_LEAD_NURTURING === 'true') {
        const savedInteraction = client.interactions[client.interactions.length - 1];
        leadNurturingService.checkInteractionForActiveNurturing(client._id, savedInteraction).catch(err => {
          console.error('Error checking interaction for active nurturing:', err);
        });
      }

      // עדכון שיחה
      const conversation = client.whatsappConversations.find(
        conv => conv.conversationId === messageId
      );

      if (conversation) {
        conversation.lastMessageDate = new Date(timestamp);
        conversation.lastMessagePreview = body.substring(0, 100);
        conversation.lastMessageFrom = 'client';
        conversation.unreadCount += 1;
      } else {
        client.whatsappConversations.push({
          conversationId: messageId,
          lastMessageDate: new Date(timestamp),
          lastMessagePreview: body.substring(0, 100),
          lastMessageFrom: 'client',
          unreadCount: 1
        });
      }

      await client.save();
    }

    // תגובה ל-Webhook
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in handleWebhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// אימות Webhook (נדרש עבור WhatsApp Business API)
exports.verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bizflow-verify-token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// שליחת הודעה
exports.sendMessage = async (req, res) => {
  try {
    const { clientId, message } = req.body;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // שליחה דרך ה-Service
    await whatsappService.sendMessage(
      client.personalInfo.whatsappPhone || client.personalInfo.phone,
      message
    );

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'whatsapp',
      direction: 'outbound',
      subject: 'הודעת WhatsApp',
      content: message,
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null
    });

    // עדכון שיחה
    const latestConv = client.whatsappConversations[client.whatsappConversations.length - 1];
    if (latestConv) {
      latestConv.lastMessageDate = new Date();
      latestConv.lastMessagePreview = message.substring(0, 100);
      latestConv.lastMessageFrom = 'us';
    }

    await client.save();

    res.json({
      success: true,
      message: 'הודעה נשלחה בהצלחה'
    });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליחת ההודעה',
      error: error.message
    });
  }
};

// שליחת תבנית
exports.sendTemplate = async (req, res) => {
  try {
    const { clientId, templateName, parameters } = req.body;

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // שליחת תבנית
    await whatsappService.sendTemplate(
      client.personalInfo.whatsappPhone || client.personalInfo.phone,
      templateName,
      parameters
    );

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'whatsapp',
      direction: 'outbound',
      subject: `תבנית: ${templateName}`,
      content: `נשלחה תבנית ${templateName}`,
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null
    });

    await client.save();

    res.json({
      success: true,
      message: 'תבנית נשלחה בהצלחה'
    });

  } catch (error) {
    console.error('Error in sendTemplate:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליחת התבנית',
      error: error.message
    });
  }
};

// קבלת כל השיחות
exports.getConversations = async (req, res) => {
  try {
    const clients = await Client.find({
      'whatsappConversations.0': { $exists: true }
    })
      .select('personalInfo businessInfo whatsappConversations status')
      .sort({ 'whatsappConversations.lastMessageDate': -1 });

    const conversations = clients.map(client => ({
      clientId: client._id,
      clientName: client.personalInfo.fullName,
      businessName: client.businessInfo.businessName,
      status: client.status,
      lastConversation: client.whatsappConversations[client.whatsappConversations.length - 1]
    }));

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת השיחות',
      error: error.message
    });
  }
};

// קבלת שיחה של לקוח ספציפי
exports.getClientConversation = async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId)
      .select('personalInfo businessInfo whatsappConversations interactions');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // מיון אינטראקציות WhatsApp בלבד
    const whatsappInteractions = client.interactions
      .filter(int => int.type === 'whatsapp')
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: {
        client: {
          id: client._id,
          name: client.personalInfo.fullName,
          businessName: client.businessInfo.businessName,
          phone: client.personalInfo.whatsappPhone || client.personalInfo.phone
        },
        conversations: client.whatsappConversations,
        messages: whatsappInteractions
      }
    });

  } catch (error) {
    console.error('Error in getClientConversation:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת השיחה',
      error: error.message
    });
  }
};

// סטטוס חיבור
exports.getConnectionStatus = async (req, res) => {
  try {
    const status = await whatsappService.getStatus();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error in getConnectionStatus:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בבדיקת סטטוס החיבור',
      error: error.message
    });
  }
};

// QR code (לצפייה בדפדפן; נדרש אימות)
exports.getQrCode = async (req, res) => {
  try {
    const qr = await whatsappService.getQr();
    // אם כבר מחובר – אין QR להציג
    if (qr.connected) {
      return res.json({ success: true, data: { connected: true } });
    }
    if (!qr.qr) {
      return res.status(404).json({
        success: false,
        message: 'אין QR זמין כרגע. ייתכן שהשירות עדיין מאתחל, או שכבר מחובר.'
      });
    }
    return res.json({ success: true, data: qr });
  } catch (error) {
    console.error('Error in getQrCode:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת QR',
      error: error.message
    });
  }
};

// QR כתמונה (SVG) לסריקה נוחה בדפדפן; נדרש אימות
exports.getQrSvg = async (req, res) => {
  try {
    const qr = await whatsappService.getQr();
    if (qr.connected) {
      return res.status(204).send();
    }
    if (!qr.qr) {
      return res.status(404).json({
        success: false,
        message: 'אין QR זמין כרגע. ייתכן שהשירות עדיין מאתחל, או שכבר מחובר.'
      });
    }

    const svg = await QRCode.toString(qr.qr, { type: 'svg', margin: 1, scale: 6 });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error in getQrSvg:', error);
    return res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת QR (SVG)',
      error: error.message
    });
  }
};
