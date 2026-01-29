const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const emailService = require('../services/emailService');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// קבלת כל החשבוניות
exports.getAllInvoices = async (req, res) => {
  try {
    const { 
      status, 
      clientId,
      search,
      sortBy = '-metadata.createdAt',
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.clientId = clientId;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'clientDetails.name': { $regex: search, $options: 'i' } },
        { 'clientDetails.businessName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .populate('clientId', 'personalInfo.fullName businessInfo.businessName')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת החשבוניות',
      error: error.message
    });
  }
};

// קבלת חשבונית בודדת
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת החשבונית',
      error: error.message
    });
  }
};

// יצירת חשבונית חדשה
exports.createInvoice = async (req, res) => {
  try {
    // יצירת מספר חשבונית אוטומטי
    const invoiceNumber = await Invoice.generateInvoiceNumber();

    const invoiceData = {
      invoiceNumber,
      ...req.body,
      metadata: {
        createdBy: isValidObjectId(req.user?.id) ? req.user.id : null
      }
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // עדכון הלקוח - הוספת החשבונית לרשימת החשבוניות
    if (invoice.clientId) {
      await Client.findByIdAndUpdate(invoice.clientId, {
        $push: { invoices: invoice._id }
      });
    }

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

// עדכון חשבונית
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'invoiceNumber') {
        invoice[key] = req.body[key];
      }
    });

    await invoice.save();

    res.json({
      success: true,
      message: 'חשבונית עודכנה בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in updateInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון החשבונית',
      error: error.message
    });
  }
};

// מחיקת חשבונית
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    // הסרת החשבונית מהלקוח
    if (invoice.clientId) {
      await Client.findByIdAndUpdate(invoice.clientId, {
        $pull: { invoices: invoice._id }
      });
    }

    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'חשבונית נמחקה בהצלחה'
    });

  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת החשבונית',
      error: error.message
    });
  }
};

// עדכון סטטוס חשבונית
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['draft', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'סטטוס לא תקין'
      });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    res.json({
      success: true,
      message: 'סטטוס החשבונית עודכן בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in updateInvoiceStatus:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון סטטוס החשבונית',
      error: error.message
    });
  }
};

// עדכון פרטי תשלום
exports.updatePayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    // עדכון פרטי תשלום
    invoice.paymentDetails = {
      ...invoice.paymentDetails,
      ...req.body
    };

    // אם שולם במלואו, עדכן תאריך תשלום
    if (req.body.paidAmount >= invoice.totalAmount && !invoice.paymentDetails.paidDate) {
      invoice.paymentDetails.paidDate = new Date();
    }

    await invoice.save();

    res.json({
      success: true,
      message: 'פרטי התשלום עודכנו בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in updatePayment:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון פרטי התשלום',
      error: error.message
    });
  }
};

// שליחת חשבונית
exports.sendInvoice = async (req, res) => {
  try {
    const { sentTo } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    invoice.status = 'sent';
    invoice.sentDate = new Date();
    invoice.sentTo = sentTo || invoice.clientDetails.email;

    await invoice.save();

    // שליחת החשבונית במייל
    const emailTo = sentTo || invoice.clientDetails.email;

    if (emailTo) {
      try {
        const dueDate = invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString('he-IL')
          : 'לא צוין';

        const invoiceData = {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientDetails.fullName || invoice.clientDetails.businessName,
          amount: invoice.total,
          dueDate: dueDate,
          pdfUrl: invoice.pdfUrl || `${process.env.CLIENT_URL}/invoices/${invoice._id}/pdf`
        };

        const emailResult = await emailService.sendInvoice(emailTo, invoiceData);

        if (emailResult.success) {
          console.log(`✅ Invoice ${invoice.invoiceNumber} sent successfully to ${emailTo}`);
        } else {
          console.warn(`⚠️ Failed to send invoice email to ${emailTo}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending invoice email:', emailError);
        // לא נכשיל את כל הפעולה אם המייל נכשל
      }
    } else {
      console.warn('⚠️ No email address provided for invoice sending');
    }

    res.json({
      success: true,
      message: 'חשבונית נשלחה בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in sendInvoice:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליחת החשבונית',
      error: error.message
    });
  }
};

// הוספת תזכורת
exports.addReminder = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    invoice.reminders.push({
      ...req.body,
      sentDate: new Date()
    });

    await invoice.save();

    res.json({
      success: true,
      message: 'תזכורת נוספה בהצלחה',
      data: invoice.reminders[invoice.reminders.length - 1]
    });

  } catch (error) {
    console.error('Error in addReminder:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהוספת התזכורת',
      error: error.message
    });
  }
};

// יצירת PDF
exports.generatePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'personalInfo businessInfo');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    // כאן תוכל להוסיף לוגיקה ליצירת PDF
    // לדוגמה באמצעות ספריית PDFKit או puppeteer
    
    // לצורך הדוגמה, נניח שיש לנו URL
    const pdfUrl = `/invoices/${invoice.invoiceNumber}.pdf`;
    
    invoice.pdfUrl = pdfUrl;
    invoice.pdfGeneratedAt = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: 'PDF נוצר בהצלחה',
      data: {
        pdfUrl: invoice.pdfUrl
      }
    });

  } catch (error) {
    console.error('Error in generatePDF:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת PDF',
      error: error.message
    });
  }
};

// סימון כששולם
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    const { paymentMethod, transactionId, paidAmount } = req.body;

    invoice.status = 'paid';
    invoice.paymentDetails = {
      ...invoice.paymentDetails,
      method: paymentMethod,
      paidAmount: paidAmount || invoice.totalAmount,
      paidDate: new Date(),
      transactionId
    };

    await invoice.save();

    // עדכון בלקוח
    const client = await Client.findById(invoice.clientId);
    if (client && client.paymentPlan) {
      const installment = client.paymentPlan.installments.find(
        inst => inst.invoiceId && inst.invoiceId.toString() === invoice._id.toString()
      );
      if (installment) {
        installment.status = 'paid';
        installment.paidDate = new Date();
        installment.paidAmount = paidAmount || invoice.totalAmount;
        await client.save();
      }
    }

    res.json({
      success: true,
      message: 'חשבונית סומנה כששולמה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in markAsPaid:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון החשבונית',
      error: error.message
    });
  }
};

// שליחת תזכורת
exports.sendReminder = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'personalInfo');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'חשבונית לא נמצאה'
      });
    }

    const { method = 'email' } = req.body;

    // כאן תוכל להוסיף לוגיקה לשליחת תזכורת בפועל

    invoice.reminders.push({
      sentDate: new Date(),
      method,
      notes: 'תזכורת לתשלום חשבונית'
    });

    await invoice.save();

    res.json({
      success: true,
      message: 'תזכורת נשלחה בהצלחה',
      data: invoice
    });

  } catch (error) {
    console.error('Error in sendReminder:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשליחת תזכורת',
      error: error.message
    });
  }
};

// סטטיסטיקות חשבוניות
exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = {
      total: await Invoice.countDocuments(),
      byStatus: await Invoice.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      overdueCount: 0,
      overdueAmount: 0
    };

    // חישוב סכומים
    const amountStats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paymentDetails.paidAmount' }
        }
      }
    ]);

    if (amountStats.length > 0) {
      stats.totalAmount = amountStats[0].totalAmount || 0;
      stats.paidAmount = amountStats[0].paidAmount || 0;
      stats.outstandingAmount = stats.totalAmount - stats.paidAmount;
    }

    // חשבוניות באיחור
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'viewed', 'partially_paid'] },
      dueDate: { $lt: new Date() }
    });

    stats.overdueCount = overdueInvoices.length;
    stats.overdueAmount = overdueInvoices.reduce((sum, inv) => {
      return sum + (inv.totalAmount - (inv.paymentDetails.paidAmount || 0));
    }, 0);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getInvoiceStats:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סטטיסטיקות החשבוניות',
      error: error.message
    });
  }
};

