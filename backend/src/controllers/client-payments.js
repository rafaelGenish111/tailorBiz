const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { isValidObjectId, enforceLeadOwnershipOnRecord, getAllowedStatusesForUser, LEAD_STATUSES, CLIENT_STATUSES } = require('./client-crud');

// ============================================================================
// Payment Plans Management
// ============================================================================

/**
 * יצירת תוכנית תשלומים
 */
exports.createPaymentPlan = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

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

/**
 * עדכון תשלום בודד
 */
exports.updateInstallment = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

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

// ============================================================================
// Invoices Management
// ============================================================================

/**
 * יצירת חשבונית
 */
exports.createInvoice = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

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

/**
 * קבלת חשבוניות
 */
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

    enforceLeadOwnershipOnRecord(req.user, client);

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

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * סטטיסטיקות כלליות
 */
exports.getOverviewStats = async (req, res) => {
  try {
    const allowedStatuses = getAllowedStatusesForUser(req.user);
    const allStatuses = [...LEAD_STATUSES, ...CLIENT_STATUSES];

    const ownershipOr = req.user?._id
      ? {
        $or: [{ 'metadata.createdBy': req.user._id }, { 'metadata.assignedTo': req.user._id }],
      }
      : null;

    const isPrivileged = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    const matchForStatuses = (statuses) => {
      const st = Array.isArray(statuses) ? statuses.filter(Boolean) : [];
      if (st.length === 0) return null;

      let effective = st;
      if (allowedStatuses !== null) {
        effective = effective.filter((s) => allowedStatuses.includes(s));
      }
      if (effective.length === 0) return null;

      let base = { status: effective.length === 1 ? effective[0] : { $in: effective } };

      // Ownership scope: for employees without viewAll, show only "their" leads/clients
      if (!isPrivileged && ownershipOr) {
        const isLeadScope = effective.every((s) => LEAD_STATUSES.includes(s));
        const isClientScope = effective.every((s) => CLIENT_STATUSES.includes(s));
        if (isLeadScope) {
          const canViewAll = Boolean(req.user?.permissions?.leads?.viewAll);
          if (!canViewAll) base = { $and: [base, ownershipOr] };
        } else if (isClientScope) {
          const canViewAll = Boolean(req.user?.permissions?.clients?.viewAll);
          if (!canViewAll) base = { $and: [base, ownershipOr] };
        }
      }

      return base;
    };

    const totalMatch = allowedStatuses === null ? null : matchForStatuses(allStatuses);
    const activeLeadsMatch = matchForStatuses(['new_lead', 'contacted', 'engaged', 'meeting_set']);
    const activeDealsMatch = matchForStatuses(['proposal_sent']);
    const wonMatch = matchForStatuses(['won']);
    const leadsMatch = matchForStatuses(LEAD_STATUSES);

    const stats = {
      totalClients: totalMatch ? await Client.countDocuments(totalMatch) : await Client.countDocuments(),
      activeLeads: activeLeadsMatch ? await Client.countDocuments(activeLeadsMatch) : 0,
      activeDeals: activeDealsMatch ? await Client.countDocuments(activeDealsMatch) : 0,
      wonDeals: wonMatch ? await Client.countDocuments(wonMatch) : 0,
      activeClients: wonMatch ? await Client.countDocuments(wonMatch) : 0,

      // הכנסות
      totalRevenue: 0,
      paidAmount: 0,
      outstandingAmount: 0,

      // פילוח לפי מקור (לידים בלבד)
      leadsBySource: leadsMatch
        ? await Client.aggregate([
          { $match: leadsMatch },
          { $group: { _id: '$leadSource', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        : [],

      // פילוח לפי סטטוס (רק מה שמותר למשתמש)
      clientsByStatus:
        allowedStatuses === null
          ? await Client.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
          : await Client.aggregate([
            { $match: totalMatch || { status: '__no_such_status__' } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),

      // ממוצע Lead Score (לידים בלבד)
      averageLeadScore: leadsMatch
        ? await Client.aggregate([{ $match: leadsMatch }, { $group: { _id: null, avgScore: { $avg: '$leadScore' } } }])
        : [],

      // פעילות אחרונה (רק מה שמותר למשתמש)
      recentActivity: await Client.find(totalMatch || {})
        .sort({ 'metadata.lastContactedAt': -1 })
        .limit(5)
        .select('personalInfo.fullName businessInfo.businessName status metadata.lastContactedAt metadata.lastInteractionType'),
    };

    // חישוב הכנסות (ללקוחות/Deals שנמצאים ב-scope)
    if (wonMatch) {
      const revenueData = await Client.aggregate([
        { $match: wonMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$metadata.stats.totalRevenue' },
            totalPaid: { $sum: '$metadata.stats.totalPaid' },
            outstanding: { $sum: '$metadata.stats.outstandingBalance' },
          },
        },
      ]);

      if (revenueData.length > 0) {
        stats.totalRevenue = revenueData[0].totalRevenue || 0;
        stats.paidAmount = revenueData[0].totalPaid || 0;
        stats.outstandingAmount = revenueData[0].outstanding || 0;
      }
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

/**
 * סטטיסטיקות Pipeline
 */
exports.getPipelineStats = async (req, res) => {
  try {
    const allowedStatuses = getAllowedStatusesForUser(req.user);

    const pipeline = [
      { stage: 'new_lead', name: 'ליד חדש', count: 0, value: 0 },
      { stage: 'contacted', name: 'צור קשר', count: 0, value: 0 },
      { stage: 'engaged', name: 'מעורבות', count: 0, value: 0 },
      { stage: 'meeting_set', name: 'פגישה נקבעה', count: 0, value: 0 },
      { stage: 'proposal_sent', name: 'הצעה נשלחה', count: 0, value: 0 },
      { stage: 'won', name: 'נסגר', count: 0, value: 0 },
      { stage: 'lost', name: 'אבוד', count: 0, value: 0 },
    ];

    // RBAC: אם אין הרשאה לשלב, נאפס אותו (כדי לא לדלוף ספירות/ערכים).
    if (allowedStatuses !== null) {
      for (const stage of pipeline) {
        if (!allowedStatuses.includes(stage.stage)) {
          stage.count = 0;
          stage.value = 0;
        }
      }
    }

    // חישוב ערך פוטנציאלי + ספירה לכל שלב
    for (const stage of pipeline) {
      if (allowedStatuses !== null && !allowedStatuses.includes(stage.stage)) {
        // Skip DB work for blocked stages
        continue;
      }
      let statusFilter = { status: stage.stage };
      // RBAC (ownership): leads viewAll=false => employee sees only their own leads in pipeline stats
      if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        const leadsPerm = req.user?.permissions?.leads;
        const canLeads = Boolean(leadsPerm?.enabled);
        const canViewAllLeads = Boolean(leadsPerm?.viewAll);
        if (canLeads && !canViewAllLeads && LEAD_STATUSES.includes(stage.stage)) {
          statusFilter.$or = [
            { 'metadata.createdBy': req.user._id },
            { 'metadata.assignedTo': req.user._id },
          ];
        }
      }

      stage.count = await Client.countDocuments(statusFilter);

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
    const conversionStatuses =
      allowedStatuses === null
        ? ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'won', 'lost']
        : allowedStatuses;

    const totalLeadsFilter = { status: { $in: conversionStatuses } };
    // אם זה עובד לידים בלבד בלי viewAll, נחשב/נחזיר נתונים רק על הלידים שלו
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      const leadsPerm = req.user?.permissions?.leads;
      const canLeads = Boolean(leadsPerm?.enabled);
      const canViewAllLeads = Boolean(leadsPerm?.viewAll);
      const isLeadOnlyScope =
        Array.isArray(allowedStatuses) &&
        allowedStatuses.length > 0 &&
        allowedStatuses.every((s) => LEAD_STATUSES.includes(s));
      if (canLeads && !canViewAllLeads && isLeadOnlyScope) {
        totalLeadsFilter.$or = [
          { 'metadata.createdBy': req.user._id },
          { 'metadata.assignedTo': req.user._id },
        ];
      }
    }
    const totalLeads = await Client.countDocuments(totalLeadsFilter);

    let wonCount = 0;
    if (allowedStatuses === null || allowedStatuses.includes('won')) {
      wonCount = await Client.countDocuments({ status: 'won' });
    }
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

/**
 * קבלת 3 הלידים החמים ביותר שלא נוצר איתם קשר ב-24 השעות האחרונות
 */
exports.getMorningFocus = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const focusQuery = {
      // רק לידים פעילים שעדיין לא לקוחות ולא אבודים
      status: { $in: ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent'] },
      // לוגיקה: או שלא יצרו איתם קשר מעולם, או שהקשר האחרון היה לפני יותר מ-24 שעות
      $or: [
        { 'metadata.lastContactedAt': { $lt: yesterday } },
        { 'metadata.lastContactedAt': { $exists: false } },
        { 'metadata.lastContactedAt': null }
      ]
    };

    // RBAC (ownership): leads viewAll=false => employee sees only their own leads
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      const leadsPerm = req.user?.permissions?.leads;
      const canLeads = Boolean(leadsPerm?.enabled);
      const canViewAllLeads = Boolean(leadsPerm?.viewAll);
      if (canLeads && !canViewAllLeads) {
        focusQuery.$or = [
          { 'metadata.createdBy': req.user._id },
          { 'metadata.assignedTo': req.user._id },
        ];
      }
    }

    const leads = await Client.find(focusQuery)
      .sort({ leadScore: -1, 'metadata.createdAt': -1 }) // קודם בעלי הניקוד הגבוה, ואז החדשים ביותר
      .limit(3)
      .select('personalInfo businessInfo leadScore status metadata.lastContactedAt interactions');

    res.json({
      success: true,
      data: leads
    });

  } catch (error) {
    console.error('Error in getMorningFocus:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת נתוני מיקוד בוקר',
      error: error.message
    });
  }
};
