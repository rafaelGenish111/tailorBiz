const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const ReferrerPartner = require('../models/ReferrerPartner');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const projectGeneratorService = require('../services/projectGeneratorService');
const leadNurturingService = require('../services/leadServiceV2');
const LEAD_STATUSES = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'];
const CLIENT_STATUSES = ['won'];

function getAllowedStatusesForUser(user) {
  if (!user) return [];
  if (user.role === 'admin' || user.role === 'super_admin') return null; // null = unrestricted

  const canLeads = Boolean(user.permissions?.leads?.enabled);
  const canClients = Boolean(user.permissions?.clients?.enabled);

  if (canLeads && canClients) return null; // unrestricted
  if (canLeads) return LEAD_STATUSES;
  if (canClients) return CLIENT_STATUSES;
  return [];
}

function enforceClientStatusAccessOnQuery(query, user, requestedStatuses) {
  const allowed = getAllowedStatusesForUser(user);
  const reqStatuses = Array.isArray(requestedStatuses) ? requestedStatuses.filter(Boolean) : [];

  // Unrestricted user (admin/super_admin): still respect explicit status filter from query params
  if (allowed === null) {
    if (reqStatuses.length) {
      query.status = reqStatuses.length === 1 ? reqStatuses[0] : { $in: reqStatuses };
      return { query, finalStatuses: reqStatuses };
    }
    return { query, finalStatuses: [] };
  }

  // If nothing allowed, block
  if (!allowed.length) {
    const err = new Error('אין הרשאה ללקוחות/לידים');
    err.statusCode = 403;
    throw err;
  }

  const finalStatuses = reqStatuses.length ? reqStatuses.filter((s) => allowed.includes(s)) : allowed;

  // If request asked for statuses the user isn't allowed to see -> return empty result
  if (reqStatuses.length && finalStatuses.length === 0) {
    // Put an impossible condition
    query.status = '__no_such_status__';
    return { query, finalStatuses: [] };
  }

  query.status = finalStatuses.length === 1 ? finalStatuses[0] : { $in: finalStatuses };
  return { query, finalStatuses };
}

function enforceLeadOwnershipOnQuery(query, user, effectiveStatuses) {
  if (!user || user.role === 'admin' || user.role === 'super_admin') return query;

  const leadsPerm = user.permissions?.leads;
  const canLeads = Boolean(leadsPerm?.enabled);
  const canViewAllLeads = Boolean(leadsPerm?.viewAll);
  if (!canLeads || canViewAllLeads) return query;

  // Apply only when we're effectively querying leads (not clients).
  const statuses = Array.isArray(effectiveStatuses) ? effectiveStatuses : [];
  const isLeadQuery = statuses.length > 0 && statuses.every((s) => LEAD_STATUSES.includes(s));
  if (!isLeadQuery) return query;

  const ownershipOr = {
    $or: [
      { 'metadata.createdBy': user._id },
      { 'metadata.assignedTo': user._id },
    ],
  };

  // If query already has an $or (e.g. search), combine safely via $and
  if (Array.isArray(query.$and)) {
    query.$and.push(ownershipOr);
    return query;
  }
  if (Array.isArray(query.$or)) {
    query.$and = [{ $or: query.$or }, ownershipOr];
    delete query.$or;
    return query;
  }

  query.$and = [ownershipOr];
  return query;
}

function enforceLeadOwnershipOnRecord(user, client) {
  if (!user || user.role === 'admin' || user.role === 'super_admin') return;
  if (!client) return;

  const status = String(client.status || '');
  const isLead = LEAD_STATUSES.includes(status);
  if (!isLead) return;

  const leadsPerm = user.permissions?.leads;
  const canLeads = Boolean(leadsPerm?.enabled);
  const canViewAllLeads = Boolean(leadsPerm?.viewAll);
  if (!canLeads || canViewAllLeads) return;

  const createdBy = client?.metadata?.createdBy ? String(client.metadata.createdBy) : null;
  const assignedTo = client?.metadata?.assignedTo ? String(client.metadata.assignedTo) : null;
  const uid = String(user._id);
  const ok = (createdBy && createdBy === uid) || (assignedTo && assignedTo === uid);
  if (!ok) {
    const err = new Error('אין הרשאה לצפות בליד זה');
    err.statusCode = 403;
    throw err;
  }
}

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

function normalizeTagsToArray(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  // allow comma-separated string in rare cases
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function syncReferrerTag(tags, referrerId) {
  const list = normalizeTagsToArray(tags);
  const cleaned = list.filter((t) => !String(t).startsWith('referrer:'));
  const rid = referrerId ? String(referrerId) : '';
  if (rid) cleaned.push(`referrer:${rid}`);
  // unique preserve order
  return Array.from(new Set(cleaned));
}

async function normalizeReferrerInput(referrerInput) {
  // allow: null => clear
  if (referrerInput === null) return null;

  // allow: "id"
  if (typeof referrerInput === 'string') {
    const id = referrerInput.trim();
    if (!id) return null;
    if (!isValidObjectId(id)) {
      const err = new Error('referrerId לא תקין');
      err.statusCode = 400;
      throw err;
    }
    const r = await ReferrerPartner.findById(id).select('displayName');
    if (!r) {
      const err = new Error('מפנה לא נמצא');
      err.statusCode = 400;
      throw err;
    }
    return { referrerId: r._id, referrerNameSnapshot: r.displayName };
  }

  // allow: { referrerId, referrerNameSnapshot? }
  if (referrerInput && typeof referrerInput === 'object') {
    const idRaw = referrerInput.referrerId;
    if (!idRaw) return null;

    const id = String(idRaw).trim();
    if (!isValidObjectId(id)) {
      const err = new Error('referrerId לא תקין');
      err.statusCode = 400;
      throw err;
    }
    const r = await ReferrerPartner.findById(id).select('displayName');
    if (!r) {
      const err = new Error('מפנה לא נמצא');
      err.statusCode = 400;
      throw err;
    }
    return {
      referrerId: r._id,
      referrerNameSnapshot: String(referrerInput.referrerNameSnapshot || r.displayName || '').trim() || r.displayName,
    };
  }

  return null;
}

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

    // RBAC: employees with leads-only must not see customers, and vice versa.
    // We enforce by restricting status values returned from this endpoint.
    const requestedStatuses = status ? String(status).split(',').map((s) => s.trim()).filter(Boolean) : [];
    const { finalStatuses } = enforceClientStatusAccessOnQuery(query, req.user, requestedStatuses);
    // RBAC (ownership): leads viewAll=false => only leads created by that employee
    enforceLeadOwnershipOnQuery(query, req.user, finalStatuses);

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
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { 'personalInfo.fullName': { $regex: escaped, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: escaped, $options: 'i' } },
        { 'personalInfo.phone': { $regex: escaped, $options: 'i' } },
        { 'personalInfo.email': { $regex: escaped, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    let q = Client.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('invoices')
      .select('-__v');

    // For super/admin: show lead ownership in UI (createdBy/assignedTo username)
    if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
      q = q
        .populate('metadata.createdBy', 'username')
        .populate('metadata.assignedTo', 'username');
    }

    const clients = await q;

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// קבלת לקוח בודד
exports.getClientById = async (req, res) => {
  try {
    let clientQuery = Client.findById(req.params.id).populate('invoices');
    if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
      clientQuery = clientQuery
        .populate('metadata.createdBy', 'username')
        .populate('metadata.assignedTo', 'username');
    }
    const client = await clientQuery;

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    // RBAC: don't allow employees to access a client record outside their module (leads vs clients)
    if (req.user?.role !== 'admin') {
      const st = String(client.status || '');
      const isLead = LEAD_STATUSES.includes(st);
      const isClient = CLIENT_STATUSES.includes(st);

      if (isLead && !req.user?.permissions?.leads?.enabled) {
        return res.status(403).json({ success: false, message: 'אין הרשאה ללידים' });
      }
      if (isClient && !req.user?.permissions?.clients?.enabled) {
        return res.status(403).json({ success: false, message: 'אין הרשאה ללקוחות' });
      }
      // For unknown statuses, keep existing behavior (allow) – can be tightened later.
    }

    // RBAC (ownership): leads viewAll=false => only allow leads created by that employee
    try {
      enforceLeadOwnershipOnRecord(req.user, client);
    } catch (e) {
      return res.status(e.statusCode || 403).json({ success: false, message: e.message || 'אין הרשאה' });
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    const normalizedReferrer = await normalizeReferrerInput(
      Object.prototype.hasOwnProperty.call(req.body || {}, 'referrer') ? req.body.referrer : undefined
    );

    const clientData = {
      ...req.body,
      referrer: normalizedReferrer,
      tags: syncReferrerTag(req.body?.tags, normalizedReferrer?.referrerId),
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

    // === NEW: Auto-generate project for active clients ===
    const activeClientStatuses = ['won'];
    console.log(`🔍 Checking project generation - Client status: ${client.status}, Active statuses:`, activeClientStatuses);
    if (activeClientStatuses.includes(client.status)) {
      const userId = req.user?.id || req.user?._id;
      console.log(`✅ Client status is active, generating project. UserId: ${userId}`);
      projectGeneratorService.generateNewClientProject(client, userId)
        .then(project => {
          if (project) {
            console.log(`✅ Project created successfully: ${project._id}`);
          } else {
            console.warn('⚠️ Project generation returned null/undefined');
          }
        })
        .catch(err => {
          console.error('❌ Background project generation failed:', err);
          console.error('Error stack:', err.stack);
        });
    } else {
      console.log(`⏭️ Skipping project generation - client status "${client.status}" is not an active client status`);
    }
    // =====================================================

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    // RBAC (ownership): leads viewAll=false => cannot modify leads not created by this employee
    enforceLeadOwnershipOnRecord(req.user, client);

    // Allow privileged users to (re)assign lead visibility without breaking metadata object
    const canAssign = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    if (canAssign && Object.prototype.hasOwnProperty.call(req.body || {}, 'assignedTo')) {
      const raw = req.body.assignedTo;
      if (raw === null || raw === '' || raw === undefined) {
        client.metadata = client.metadata || {};
        client.metadata.assignedTo = null;
      } else if (isValidObjectId(raw)) {
        client.metadata = client.metadata || {};
        client.metadata.assignedTo = raw;
      }
      // Remove so generic loop won't create a stray field
      delete req.body.assignedTo;
    }

    const oldStatus = client.status;

    // Handle referrer explicitly (so we can validate and also keep tags consistent)
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'referrer')) {
      const normalizedReferrer = await normalizeReferrerInput(req.body.referrer);
      client.referrer = normalizedReferrer;
      delete req.body.referrer;
    }

    // עדכון שדות - allowlist בלבד למניעת mass-assignment
    const CLIENT_UPDATABLE_FIELDS = [
      'personalInfo', 'businessInfo', 'assessmentForm', 'status',
      'lostReason', 'lostReasonNotes', 'leadSource', 'leadScore',
      'tags', 'interactions', 'orders', 'paymentPlan', 'proposal',
      'contract', 'invoices', 'tasks', 'generalNotes', 'attachments',
      'aiPreferences', 'whatsappConversations', 'conversationHistory',
    ];
    Object.keys(req.body).forEach(key => {
      if (CLIENT_UPDATABLE_FIELDS.includes(key)) {
        client[key] = req.body[key];
      }
    });

    // Ensure tags are consistent with referrer selection
    client.tags = syncReferrerTag(client.tags, client.referrer?.referrerId);

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

    // === NEW: Auto-generate project if status changed to active client status ===
    const activeClientStatuses = ['won'];
    const leadStatuses = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'];

    // בדוק אם הסטטוס השתנה מליד ללקוח פעיל
    const changedToActiveClient =
      leadStatuses.includes(oldStatus) &&
      activeClientStatuses.includes(client.status);

    if (changedToActiveClient) {
      console.log(`🔄 updateClient - Status changed from "${oldStatus}" to "${client.status}" - checking for existing project`);

      // בדוק אם כבר יש פרויקט ללקוח הזה
      const existingProject = await Project.findOne({ clientId: client._id });

      if (!existingProject) {
        console.log(`✅ updateClient - No existing project found, generating new project`);
        const userId = req.user?.id || req.user?._id;
        projectGeneratorService.generateNewClientProject(client, userId)
          .then(project => {
            if (project) {
              console.log(`✅ updateClient - Project created: ${project._id}`);
            } else {
              console.warn('⚠️ updateClient - Project generation returned null/undefined');
            }
          })
          .catch(err => {
            console.error('❌ updateClient - Background project generation failed:', err);
            console.error('Error stack:', err.stack);
          });
      } else {
        console.log(`⏭️ updateClient - Client already has a project (${existingProject._id}), skipping generation`);
      }
    }
    // =====================================================

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    // RBAC (ownership): leads viewAll=false => cannot convert leads not created by this employee
    enforceLeadOwnershipOnRecord(req.user, client);

    const { finalPrice, notes, signedAt } = req.body;
    const contractFile = req.file;

    const oldStatus = client.status;

    // עדכון סטטוס ל-won (מעבר ללקוח)
    client.status = 'won';

    // עדכון פרטי הצעה וחוזה
    if (finalPrice) client.proposal.finalPrice = Number(finalPrice);

    let contractData = {
      signed: true,
      signedAt: signedAt ? new Date(signedAt) : new Date(),
      notes: notes
    };

    if (contractFile) {
      const IS_VERCEL = process.env.VERCEL === '1';
      let fileUrlForPreview = undefined;

      if (IS_VERCEL && contractFile.buffer) {
        // ב-Vercel אין מערכת קבצים - נשתמש ב-data URL לצורך תצוגה מקדימה
        try {
          const base64 = contractFile.buffer.toString('base64');
          fileUrlForPreview = `data:${contractFile.mimetype || 'application/pdf'};base64,${base64}`;
        } catch (e) {
          console.error('Failed to build data URL for contract file in convertLeadToClient:', e.message);
        }
      }

      // בסביבת פיתוח מקומית נשתמש בנתיב הקובץ שנשמר בדיסק
      if (!fileUrlForPreview && contractFile.filename) {
        fileUrlForPreview = `/uploads/contracts/${contractFile.filename}`;
      }

      contractData.fileUrl = fileUrlForPreview;
    } else if (client.contract?.fileUrl) {
      // אם כבר היה חוזה קודם, נשמור את ה-URL הקיים
      contractData.fileUrl = client.contract.fileUrl;
    }

    client.contract = contractData;

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

    // === NEW: Auto-generate project ===
    console.log(`🔄 convertLeadToClient - Client status changed to: ${client.status}`);
    const userId = req.user?.id || req.user?._id;
    console.log(`🔄 convertLeadToClient - Calling generateNewClientProject. UserId: ${userId}`);
    projectGeneratorService.generateNewClientProject(client, userId)
      .then(project => {
        if (project) {
          console.log(`✅ convertLeadToClient - Project created: ${project._id}`);
        } else {
          console.warn('⚠️ convertLeadToClient - Project generation returned null/undefined');
        }
      })
      .catch(err => {
        console.error('❌ convertLeadToClient - Background project generation failed:', err);
        console.error('Error stack:', err.stack);
      });
    // ==================================

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
      message: 'הליד הומר ללקוח בהצלחה (תהליך הקמת פרויקט החל ברקע)',
      data: client
    });

  } catch (error) {
    console.error('Error in convertLeadToClient:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהמרת הליד ללקוח',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// עדכון / העלאת חוזה ללקוח/ליד קיים
exports.uploadContract = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    const contractFile = req.file;
    const { signed, signedAt, notes } = req.body;

    if (!contractFile && signed === undefined && signedAt === undefined && !notes) {
      return res.status(400).json({
        success: false,
        message: 'לא סופקו נתונים לעדכון החוזה'
      });
    }

    const currentContract = client.contract || {};

    // עדכון שדות חוזה
    if (contractFile) {
      const IS_VERCEL = process.env.VERCEL === '1';

      let fileUrlForPreview = null;

      if (IS_VERCEL && contractFile.buffer) {
        // ב-Vercel אין מערכת קבצים - נשתמש ב-data URL לצורך תצוגה מקדימה
        try {
          const base64 = contractFile.buffer.toString('base64');
          fileUrlForPreview = `data:${contractFile.mimetype || 'application/pdf'};base64,${base64}`;
        } catch (e) {
          console.error('Failed to build data URL for contract file:', e.message);
        }
      }

      // בסביבת פיתוח מקומית נשתמש בנתיב הקובץ שנשמר בדיסק
      if (!fileUrlForPreview && contractFile.filename) {
        fileUrlForPreview = `/uploads/contracts/${contractFile.filename}`;
      }

      currentContract.fileUrl = fileUrlForPreview || currentContract.fileUrl;
      currentContract.signed = true;
      if (!currentContract.signedAt) {
        currentContract.signedAt = new Date();
      }
    }

    if (signed !== undefined) {
      currentContract.signed = signed === 'true' || signed === true;
    }

    if (signedAt) {
      currentContract.signedAt = new Date(signedAt);
    }

    if (typeof notes === 'string') {
      currentContract.notes = notes;
    }

    client.contract = currentContract;
    await client.save();

    res.json({
      success: true,
      message: 'החוזה עודכן בהצלחה',
      data: client.contract
    });
  } catch (error) {
    console.error('Error in uploadContract:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון החוזה',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// קבלת פרטי החוזה עבור לקוח/ליד
exports.getContract = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('contract');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'לקוח לא נמצא'
      });
    }

    enforceLeadOwnershipOnRecord(req.user, client);

    res.json({
      success: true,
      data: client.contract || null
    });
  } catch (error) {
    console.error('Error in getContract:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת החוזה',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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

    // עדכון סטטוס אם זה אפיון ראשון (Sales OS)
    if (client.status === 'new_lead' || client.status === 'contacted') {
      client.status = 'engaged';
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

    // יצירת מספר הזמנה אוטומטי
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const order = {
      orderNumber,
      ...req.body,
      orderDate: new Date()
    };

    client.orders.push(order);

    // עדכון סטטוס אם זו הזמנה ראשונה (Sales OS)
    if (client.status === 'proposal_sent') {
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

    res.json({
      success: true,
      data: client.orders
    });

  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת ההזמנות',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
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

    enforceLeadOwnershipOnRecord(req.user, client);

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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// סטטיסטיקות כלליות
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// סטטיסטיקות Pipeline
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

    // חישוב ערך פוטנציאלי + ספירה לכל שלב — aggregation יחיד במקום N+1
    const allowedStageNames = pipeline
      .filter(s => allowedStatuses === null || allowedStatuses.includes(s.stage))
      .map(s => s.stage);

    if (allowedStageNames.length > 0) {
      const matchFilter = { status: { $in: allowedStageNames } };

      // RBAC (ownership): leads viewAll=false => employee sees only their own leads
      const isPriv = req.user?.role === 'admin' || req.user?.role === 'super_admin';
      const leadsPerm = req.user?.permissions?.leads;
      const canLeads = Boolean(leadsPerm?.enabled);
      const canViewAllLeads = Boolean(leadsPerm?.viewAll);
      const needsOwnership = !isPriv && canLeads && !canViewAllLeads;

      let ownershipMatch = null;
      if (needsOwnership) {
        ownershipMatch = {
          $or: [
            { 'metadata.createdBy': req.user._id },
            { 'metadata.assignedTo': req.user._id },
          ],
        };
      }

      const aggPipeline = [
        { $match: matchFilter },
        {
          $addFields: {
            _orderTotal: { $sum: '$orders.totalAmount' },
            _planTotal: { $ifNull: ['$paymentPlan.totalAmount', 0] },
            _isLead: { $in: ['$status', LEAD_STATUSES] },
          },
        },
      ];

      // Apply ownership filter for lead stages only
      if (needsOwnership) {
        aggPipeline.push({
          $match: {
            $or: [
              { _isLead: false },
              { ...ownershipMatch },
            ],
          },
        });
      }

      aggPipeline.push(
        {
          $addFields: {
            _stageValue: { $max: ['$_orderTotal', '$_planTotal'] },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            value: { $sum: '$_stageValue' },
          },
        }
      );

      const aggResults = await Client.aggregate(aggPipeline);
      const resultMap = {};
      for (const r of aggResults) {
        resultMap[r._id] = { count: r.count, value: r.value };
      }

      for (const stage of pipeline) {
        if (resultMap[stage.stage]) {
          stage.count = resultMap[stage.stage].count;
          stage.value = resultMap[stage.stage].value;
        }
      }
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// קבלת 3 הלידים החמים ביותר שלא נוצר איתם קשר ב-24 השעות האחרונות
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
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

