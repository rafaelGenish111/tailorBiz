const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const leadNurturingService = require('../services/leadNurturingService');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// קבלת כל הלקוחות עם פילטרים וסינון
exports.getAllClients = async (req, res) => {
  try {
    const { 
      status, 
      leadSource, 
      search, 
      tags,
      minScore,
      sortBy = '-metadata.createdAt',
      page = 1,
      limit = 20
    } = req.query;

    // בניית query
    let query = {};

    if (status) {
      const statuses = status.split(',');
      if (statuses.length > 1) {
        query.status = { $in: statuses };
      } else {
        query.status = status;
      }
    }

    if (leadSource) {
      query.leadSource = leadSource;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (minScore) {
      query.leadScore = { $gte: parseInt(minScore) };
    }

    if (search) {
      query.$or = [
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { 'personalInfo.phone': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const clients = await Client.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('invoices')
      .select('-__v');

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: clients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in getAllClients:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הלקוחות',
      error: error.message
    });
  }
};

// קבלת לקוח בודד
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('invoices');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    res.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error in getClientById:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הלקוח',
      error: error.message
    });
  }
};

// יצירת לקוח חדש
exports.createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const clientData = {
      ...req.body,
      metadata: {
        createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
        assignedTo: isValidObjectId(req.body.assignedTo) 
          ? req.body.assignedTo 
          : (isValidObjectId(req.user?.id) ? req.user.id : null)
      }
    };

    const client = new Client(clientData);
    await client.save();

    // הפעל אוטומציות טיפוח לליד חדש (אסינכרוני - לא מחכה)
    leadNurturingService.checkTriggersForNewLead(client._id).catch(err => {
      console.error('Error triggering nurturing for new lead:', err);
    });

    res.status(201).json({
      success: true,
      message: 'לקוח נוצר בהצלחה',
      data: client
    });

  } catch (error) {
    console.error('Error in createClient:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'מספר הטלפון כבר קיים במערכת'
      });
    }

    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת הלקוח',
      error: error.message
    });
  }
};

// עדכון לקוח
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const oldStatus = client.status;

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        client[key] = req.body[key];
      }
    });

    await client.save();

    // בדיקת טריגרים לשינוי סטטוס
    if (
      process.env.ENABLE_LEAD_NURTURING === 'true' &&
      typeof oldStatus === 'string' &&
      typeof client.status === 'string' &&
      oldStatus !== client.status
    ) {
      leadNurturingService.checkTriggersForStatusChange(client._id, oldStatus, client.status).catch(err => {
        console.error('Error checking status-change triggers:', err);
      });
    }

    res.json({
      success: true,
      message: 'לקוח עודכן בהצלחה',
      data: client
    });

  } catch (error) {
    console.error('Error in updateClient:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון הלקוח',
      error: error.message
    });
  }
};

// המרת ליד ללקוח (סגירת עסקה)
exports.convertLeadToClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'לקוח לא נמצא' });
    }

    const { finalPrice, notes, signedAt } = req.body;
    const contractFile = req.file;

    const oldStatus = client.status;
    
    // עדכון סטטוס ל-won (מעבר ללקוח)
    client.status = 'won'; 
    
    // עדכון פרטי הצעה וחוזה
    if (finalPrice) client.proposal.finalPrice = Number(finalPrice);
    
    client.contract = {
      signed: true,
      signedAt: signedAt ? new Date(signedAt) : new Date(),
      notes: notes,
      fileUrl: contractFile ? `/uploads/contracts/${contractFile.filename}` : undefined
    };

    // הוספת אינטראקציה של סגירה
    const interaction = {
      type: 'note', // או 'deal_won' אם נוסיף סוג כזה
      direction: 'inbound', // נחשב כפעולה חיובית מצד הלקוח
      subject: '🎯 עסקה נסגרה - חוזה נחתם',
      content: `העסקה נסגרה בהצלחה! סכום סופי: ${finalPrice || client.proposal.finalPrice || 0} ₪.\n${notes ? 'הערות: ' + notes : ''}`,
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      completed: true,
      attachments: contractFile ? [{
        filename: contractFile.originalname,
        url: `/uploads/contracts/${contractFile.filename}`,
        fileType: contractFile.mimetype,
        uploadedAt: new Date()
      }] : []
    };
    
    client.interactions.push(interaction);

    await client.save();

    // בדיקת טריגרים ואוטומציות
    if (process.env.ENABLE_LEAD_NURTURING === 'true') {
      // 1. עצירת רצפי לידים פעילים (בגלל שהסטטוס השתנה והייתה אינטראקציה inbound)
      // זה יקרה אוטומטית ב-checkInteractionForActiveNurturing אם נקרא לו, אבל כאן שינינו סטטוס אז ה-Status Change יתפוס
      
      const savedInteraction = client.interactions[client.interactions.length - 1];

      // בדיקת טריגרים לשינוי סטטוס (למשל הפעלת רצף "סגירה מוצלחת")
      if (oldStatus !== client.status) {
        leadNurturingService.checkTriggersForStatusChange(client._id, oldStatus, client.status).catch(err => {
          console.error('Error checking status-change triggers:', err);
        });
      }
      
      // בדיקת טריגרים לאינטראקציה (למשל אם יש רצף שמבוסס על "עסקה נסגרה")
       leadNurturingService.checkTriggersForInteraction(client._id, savedInteraction).catch(err => {
        console.error('Error checking interaction-based triggers:', err);
      });
    }

    res.json({
      success: true,
      message: 'הליד הומר ללקוח בהצלחה',
      data: client
    });

  } catch (error) {
    console.error('Error in convertLeadToClient:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהמרת הליד ללקוח',
      error: error.message
    });
  }
};

// מחיקת לקוח
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    await client.deleteOne();

    res.json({
      success: true,
      message: 'לקוח נמחק בהצלחה'
    });

  } catch (error) {
    console.error('Error in deleteClient:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת הלקוח',
      error: error.message
    });
  }
};

// מילוי שאלון אפיון
exports.fillAssessmentForm = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // עדכון שאלון אפיון
    client.assessmentForm = {
      ...req.body,
      filledAt: new Date()
    };

    // אם יש פרטים אישיים/עסקיים בשאלון, עדכן גם אותם
    if (req.body.basicInfo) {
      if (req.body.basicInfo.businessDescription) {
        client.businessInfo.businessType = req.body.basicInfo.businessDescription;
      }
      if (req.body.basicInfo.numberOfEmployees) {
        client.businessInfo.numberOfEmployees = req.body.basicInfo.numberOfEmployees;
      }
    }

    // עדכון סטטוס אם זה אפיון ראשון
    if (client.status === 'lead' || client.status === 'contacted') {
      client.status = 'assessment_completed';
    }

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'note',
      direction: 'outbound',
      subject: 'שאלון אפיון הושלם',
      content: 'שאלון אפיון טלפוני הושלם',
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      completed: true
    });

    await client.save();

    res.json({
      success: true,
      message: 'שאלון אפיון נשמר בהצלחה',
      data: client
    });

  } catch (error) {
    console.error('Error in fillAssessmentForm:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשמירת שאלון האפיון',
      error: error.message
    });
  }
};

// קבלת שאלון אפיון
exports.getAssessmentForm = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('personalInfo businessInfo assessmentForm');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    res.json({
      success: true,
      data: {
        personalInfo: client.personalInfo,
        businessInfo: client.businessInfo,
        assessmentForm: client.assessmentForm
      }
    });

  } catch (error) {
    console.error('Error in getAssessmentForm:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת שאלון האפיון',
      error: error.message
    });
  }
};

// הוספת אינטראקציה
exports.addInteraction = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const interaction = {
      ...req.body,
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      timestamp: new Date()
    };

    client.interactions.push(interaction);
    await client.save();

    // בדוק אם צריך לעדכן/לעצור רצפי טיפוח פעילים או לפתוח רצפים חדשים
    if (process.env.ENABLE_LEAD_NURTURING === 'true') {
      const savedInteraction = client.interactions[client.interactions.length - 1];
      leadNurturingService.checkInteractionForActiveNurturing(client._id, savedInteraction).catch(err => {
        console.error('Error checking interaction for active nurturing:', err);
      });
      leadNurturingService.checkTriggersForInteraction(client._id, savedInteraction).catch(err => {
        console.error('Error checking interaction-based triggers:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'אינטראקציה נוספה בהצלחה',
      data: client.interactions[client.interactions.length - 1]
    });

  } catch (error) {
    console.error('Error in addInteraction:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהוספת אינטראקציה',
      error: error.message
    });
  }
};

// קבלת אינטראקציות
exports.getInteractions = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('interactions');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // מיון לפי תאריך (החדש ביותר ראשון)
    const sortedInteractions = client.interactions.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({
      success: true,
      data: sortedInteractions
    });

  } catch (error) {
    console.error('Error in getInteractions:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת האינטראקציות',
      error: error.message
    });
  }
};

// עדכון אינטראקציה
exports.updateInteraction = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const interaction = client.interactions.id(req.params.interactionId);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'אינטראקציה לא נמצאה'
      });
    }

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      interaction[key] = req.body[key];
    });

    if (req.body.completed && !interaction.completedAt) {
      interaction.completedAt = new Date();
    }

    await client.save();

    res.json({
      success: true,
      message: 'אינטראקציה עודכנה בהצלחה',
      data: interaction
    });

  } catch (error) {
    console.error('Error in updateInteraction:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון האינטראקציה',
      error: error.message
    });
  }
};

// מחיקת אינטראקציה
exports.deleteInteraction = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const interaction = client.interactions.id(req.params.interactionId);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'אינטראקציה לא נמצאה'
      });
    }

    interaction.deleteOne();
    await client.save();

    res.json({
      success: true,
      message: 'אינטראקציה נמחקה בהצלחה'
    });

  } catch (error) {
    console.error('Error in deleteInteraction:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת האינטראקציה',
      error: error.message
    });
  }
};

// יצירת הזמנה
exports.createOrder = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // יצירת מספר הזמנה אוטומטי
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const order = {
      orderNumber,
      ...req.body,
      orderDate: new Date()
    };

    client.orders.push(order);

    // עדכון סטטוס אם זו הזמנה ראשונה
    if (client.status === 'proposal_sent' || client.status === 'negotiation') {
      client.status = 'won';
    }

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'note',
      direction: 'outbound',
      subject: 'הזמנה חדשה נוצרה',
      content: `הזמנה ${orderNumber} נוצרה בסכום ${order.totalAmount} ₪`,
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      completed: true
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: 'הזמנה נוצרה בהצלחה',
      data: client.orders[client.orders.length - 1]
    });

  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת ההזמנה',
      error: error.message
    });
  }
};

// קבלת הזמנות
exports.getOrders = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .select('orders');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    res.json({
      success: true,
      data: client.orders
    });

  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ההזמנות',
      error: error.message
    });
  }
};

// עדכון הזמנה
exports.updateOrder = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const order = client.orders.id(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'הזמנה לא נמצאה'
      });
    }

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      order[key] = req.body[key];
    });

    // אם ההזמנה הושלמה
    if (req.body.status === 'completed' && !order.actualCompletionDate) {
      order.actualCompletionDate = new Date();
    }

    await client.save();

    res.json({
      success: true,
      message: 'הזמנה עודכנה בהצלחה',
      data: order
    });

  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון ההזמנה',
      error: error.message
    });
  }
};

// יצירת תוכנית תשלומים
exports.createPaymentPlan = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    client.paymentPlan = req.body;
    await client.save();

    res.status(201).json({
      success: true,
      message: 'תוכנית תשלומים נוצרה בהצלחה',
      data: client.paymentPlan
    });

  } catch (error) {
    console.error('Error in createPaymentPlan:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת תוכנית התשלומים',
      error: error.message
    });
  }
};

// עדכון תשלום בודד
exports.updateInstallment = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const installment = client.paymentPlan.installments.id(req.params.installmentId);

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'תשלום לא נמצא'
      });
    }

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      installment[key] = req.body[key];
    });

    // אם התשלום שולם
    if (req.body.status === 'paid' && !installment.paidDate) {
      installment.paidDate = new Date();
      installment.paidAmount = installment.amount;
    }

    await client.save();

    res.json({
      success: true,
      message: 'תשלום עודכן בהצלחה',
      data: installment
    });

  } catch (error) {
    console.error('Error in updateInstallment:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון התשלום',
      error: error.message
    });
  }
};

// יצירת חשבונית
exports.createInvoice = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // יצירת מספר חשבונית אוטומטי
    const invoiceNumber = await Invoice.generateInvoiceNumber();

    // העתקת פרטי הלקוח לחשבונית
    const invoiceData = {
      invoiceNumber,
      clientId: client._id,
      clientDetails: {
        name: client.personalInfo.fullName,
        businessName: client.businessInfo.businessName,
        address: client.businessInfo.address,
        phone: client.personalInfo.phone,
        email: client.personalInfo.email
      },
      ...req.body,
      metadata: {
        createdBy: isValidObjectId(req.user?.id) ? req.user.id : null
      }
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // הוספת החשבונית ללקוח
    client.invoices.push(invoice._id);

    // הוספת אינטראקציה
    client.interactions.push({
      type: 'note',
      direction: 'outbound',
      subject: 'חשבונית נוצרה',
      content: `חשבונית ${invoiceNumber} נוצרה בסכום ${invoice.totalAmount} ₪`,
      timestamp: new Date(),
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      completed: true
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: 'חשבונית נוצרה בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in createInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת החשבונית',
      error: error.message
    });
  }
};

// קבלת חשבוניות
exports.getInvoices = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('invoices');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    res.json({
      success: true,
      data: client.invoices
    });

  } catch (error) {
    console.error('Error in getInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת החשבוניות',
      error: error.message
    });
  }
};

// יצירת משימה
exports.createTask = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const task = {
      ...req.body,
      createdBy: isValidObjectId(req.user?.id) ? req.user.id : null,
      assignedTo: isValidObjectId(req.body.assignedTo) 
        ? req.body.assignedTo 
        : (isValidObjectId(req.user?.id) ? req.user.id : null)
    };

    client.tasks.push(task);
    await client.save();

    res.status(201).json({
      success: true,
      message: 'משימה נוצרה בהצלחה',
      data: client.tasks[client.tasks.length - 1]
    });

  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת המשימה',
      error: error.message
    });
  }
};

// קבלת משימות
exports.getTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    const client = await Client.findById(req.params.id)
      .select('tasks');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    let tasks = client.tasks;

    // פילטר לפי סטטוס
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    // פילטר לפי עדיפות
    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    // מיון לפי תאריך יעד
    tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת המשימות',
      error: error.message
    });
  }
};

// עדכון משימה
exports.updateTask = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    const task = client.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'משימה לא נמצאה'
      });
    }

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    // אם המשימה הושלמה
    if (req.body.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
    }

    await client.save();

    res.json({
      success: true,
      message: 'משימה עודכנה בהצלחה',
      data: task
    });

  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון המשימה',
      error: error.message
    });
  }
};

// סטטיסטיקות כלליות
exports.getOverviewStats = async (req, res) => {
  try {
    const stats = {
      // ספירות בסיסיות
      totalClients: await Client.countDocuments(),
      activeLeads: await Client.countDocuments({ 
        status: { $in: ['lead', 'contacted', 'assessment_scheduled', 'assessment_completed'] } 
      }),
      activeDeals: await Client.countDocuments({ 
        status: { $in: ['proposal_sent', 'negotiation'] } 
      }),
      wonDeals: await Client.countDocuments({ status: 'won' }),
      activeClients: await Client.countDocuments({ 
        status: { $in: ['active_client', 'in_development'] } 
      }),
      
      // הכנסות
      totalRevenue: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      
      // פילוח לפי מקור
      leadsBySource: await Client.aggregate([
        { $group: { _id: '$leadSource', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // פילוח לפי סטטוס
      clientsByStatus: await Client.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // ממוצע Lead Score
      averageLeadScore: await Client.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$leadScore' } } }
      ]),
      
      // פעילות אחרונה
      recentActivity: await Client.find()
        .sort({ 'metadata.lastContactedAt': -1 })
        .limit(5)
        .select('personalInfo.fullName businessInfo.businessName status metadata.lastContactedAt metadata.lastInteractionType')
    };

    // חישוב הכנסות
    const revenueData = await Client.aggregate([
      { $match: { status: { $in: ['won', 'active_client', 'in_development', 'completed'] } } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$metadata.stats.totalRevenue' },
        totalPaid: { $sum: '$metadata.stats.totalPaid' },
        outstanding: { $sum: '$metadata.stats.outstandingBalance' }
      }}
    ]);

    if (revenueData.length > 0) {
      stats.totalRevenue = revenueData[0].totalRevenue || 0;
      stats.paidAmount = revenueData[0].totalPaid || 0;
      stats.outstandingAmount = revenueData[0].outstanding || 0;
    }

    stats.averageLeadScore = stats.averageLeadScore[0]?.avgScore || 0;

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getOverviewStats:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הסטטיסטיקות',
      error: error.message
    });
  }
};

// סטטיסטיקות Pipeline
exports.getPipelineStats = async (req, res) => {
  try {
    const pipeline = [
      {
        stage: 'lead',
        name: 'לידים חדשים',
        count: await Client.countDocuments({ status: 'lead' }),
        value: 0
      },
      {
        stage: 'contacted',
        name: 'צור קשר',
        count: await Client.countDocuments({ status: 'contacted' }),
        value: 0
      },
      {
        stage: 'assessment',
        name: 'אפיון',
        count: await Client.countDocuments({ 
          status: { $in: ['assessment_scheduled', 'assessment_completed'] } 
        }),
        value: 0
      },
      {
        stage: 'proposal',
        name: 'הצעת מחיר',
        count: await Client.countDocuments({ status: 'proposal_sent' }),
        value: 0
      },
      {
        stage: 'negotiation',
        name: 'משא ומתן',
        count: await Client.countDocuments({ status: 'negotiation' }),
        value: 0
      },
      {
        stage: 'won',
        name: 'נסגר',
        count: await Client.countDocuments({ status: 'won' }),
        value: 0
      }
    ];

    // חישוב ערך פוטנציאלי לכל שלב
    for (const stage of pipeline) {
      let statusFilter = {};
      
      if (stage.stage === 'assessment') {
        statusFilter = { status: { $in: ['assessment_scheduled', 'assessment_completed'] } };
      } else {
        statusFilter = { status: stage.stage };
      }

      const clients = await Client.find(statusFilter)
        .select('paymentPlan.totalAmount orders.totalAmount');

      stage.value = clients.reduce((sum, client) => {
        const orderValue = client.orders.reduce((orderSum, order) => 
          orderSum + (order.totalAmount || 0), 0);
        const planValue = client.paymentPlan?.totalAmount || 0;
        return sum + Math.max(orderValue, planValue);
      }, 0);
    }

    // חישוב conversion rates
    const totalLeads = await Client.countDocuments();
    const wonCount = await Client.countDocuments({ status: 'won' });
    const conversionRate = totalLeads > 0 ? ((wonCount / totalLeads) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        pipeline,
        metrics: {
          totalLeads,
          wonDeals: wonCount,
          conversionRate: parseFloat(conversionRate),
          totalPipelineValue: pipeline.reduce((sum, stage) => sum + stage.value, 0)
        }
      }
    });

  } catch (error) {
    console.error('Error in getPipelineStats:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סטטיסטיקות Pipeline',
      error: error.message
    });
  }
};

