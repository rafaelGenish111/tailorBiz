const Client = require('../models/Client');
const Project = require('../models/Project');
const ReferrerPartner = require('../models/ReferrerPartner');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const projectGeneratorService = require('../services/projectGeneratorService');
const leadNurturingService = require('../services/leadServiceV2');

const LEAD_STATUSES = ['new_lead', 'contacted', 'engaged', 'meeting_set', 'proposal_sent', 'lost'];
const CLIENT_STATUSES = ['won'];

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * קבלת כל הלקוחות עם פילטרים וסינון
 */
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
      query.$or = [
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { 'personalInfo.phone': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
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
      error: error.message
    });
  }
};

/**
 * קבלת לקוח בודד
 */
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
      error: error.message
    });
  }
};

/**
 * יצירת לקוח חדש
 */
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
      error: error.message
    });
  }
};

/**
 * עדכון לקוח
 */
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

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
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
      error: error.message
    });
  }
};

/**
 * המרת ליד ללקוח (סגירת עסקה)
 */
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
      error: error.message
    });
  }
};

/**
 * מחיקת לקוח
 */
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
      error: error.message
    });
  }
};

// Export helper functions for use by other controllers
module.exports.isValidObjectId = isValidObjectId;
module.exports.enforceLeadOwnershipOnRecord = enforceLeadOwnershipOnRecord;
module.exports.getAllowedStatusesForUser = getAllowedStatusesForUser;
module.exports.LEAD_STATUSES = LEAD_STATUSES;
module.exports.CLIENT_STATUSES = CLIENT_STATUSES;
