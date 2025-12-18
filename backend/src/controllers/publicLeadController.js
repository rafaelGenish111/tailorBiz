const { validationResult } = require('express-validator');
const Client = require('../models/Client');
const leadNurturingService = require('../services/leadNurturingService');

function normalizeILPhoneToDigits(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  // אם הגיע בפורמט בינלאומי 972XXXXXXXXX -> נשמור מקומי 0XXXXXXXXX
  if (digits.startsWith('972') && digits.length >= 11) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

function buildWebsiteLeadInteraction({ name, email, phone, company, message }) {
  const lines = [];
  if (message) lines.push(message);
  lines.push('');
  lines.push('---');
  if (name) lines.push(`שם: ${name}`);
  if (company) lines.push(`עסק: ${company}`);
  if (phone) lines.push(`טלפון: ${phone}`);
  if (email) lines.push(`אימייל: ${email}`);
  return lines.join('\n').trim();
}

exports.submitWebsiteLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'נתונים לא תקינים',
        errors: errors.array(),
      });
    }

    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const company = String(req.body?.company || '').trim();
    const message = String(req.body?.message || '').trim();

    const phoneDigits = normalizeILPhoneToDigits(req.body?.phone);
    if (!phoneDigits) {
      return res.status(400).json({
        success: false,
        message: 'טלפון הוא שדה חובה',
      });
    }

    // נסה למצוא ליד/לקוח קיים לפי טלפון (מפתח ייחודי)
    let existing = await Client.findOne({ 'personalInfo.phone': phoneDigits });

    // fallback: אם בעבר נשמרו מקפים/רווחים, ננסה התאמה גסה (לא מושלם, אבל עוזר)
    if (!existing) {
      const phoneLoose = String(req.body?.phone || '').trim();
      if (phoneLoose && phoneLoose !== phoneDigits) {
        existing = await Client.findOne({ 'personalInfo.phone': phoneLoose });
      }
    }

    const interactionContent = buildWebsiteLeadInteraction({
      name,
      email,
      phone: phoneDigits,
      company,
      message,
    });

    if (existing) {
      // עדכון עדין + הוספת אינטראקציה חדשה
      if (!existing.personalInfo?.fullName && name) {
        existing.personalInfo = existing.personalInfo || {};
        existing.personalInfo.fullName = name;
      }
      if (email && !existing.personalInfo?.email) {
        existing.personalInfo = existing.personalInfo || {};
        existing.personalInfo.email = email;
      }
      if (company && (!existing.businessInfo?.businessName || existing.businessInfo.businessName === 'לא צוין')) {
        existing.businessInfo = existing.businessInfo || {};
        existing.businessInfo.businessName = company;
      }

      existing.tags = Array.from(new Set([...(existing.tags || []), 'טופס אתר', 'website_form']));

      existing.interactions = existing.interactions || [];
      existing.interactions.push({
        type: 'note',
        direction: 'inbound',
        subject: '🌐 פניה חדשה מהאתר',
        content: interactionContent,
        timestamp: new Date(),
        completed: true,
      });

      await existing.save();

      // הפעל טריגרים לליד חדש (אסינכרוני)
      leadNurturingService.checkTriggersForNewLead(existing._id).catch((err) => {
        console.error('Error triggering nurturing for website lead (existing):', err);
      });

      return res.status(200).json({
        success: true,
        message: 'הפרטים נשמרו בהצלחה',
        data: { id: existing._id, updated: true },
      });
    }

    const client = new Client({
      personalInfo: {
        fullName: name,
        phone: phoneDigits,
        email: email || undefined,
        whatsappPhone: phoneDigits,
        preferredContactMethod: email ? 'email' : 'phone',
      },
      businessInfo: {
        businessName: company || 'לא צוין',
      },
      leadSource: 'website_form',
      status: 'new_lead',
      tags: ['ליד חדש', 'טופס אתר', 'website_form'],
      interactions: [
        {
          type: 'note',
          direction: 'inbound',
          subject: '🌐 פניה מהאתר',
          content: interactionContent,
          timestamp: new Date(),
          completed: true,
        },
      ],
      metadata: {
        createdBy: null,
        assignedTo: null,
      },
    });

    await client.save();

    // הפעל טריגרים לליד חדש (אסינכרוני)
    leadNurturingService.checkTriggersForNewLead(client._id).catch((err) => {
      console.error('Error triggering nurturing for website lead (new):', err);
    });

    return res.status(201).json({
      success: true,
      message: 'הליד נשמר בהצלחה',
      data: { id: client._id, created: true },
    });
  } catch (error) {
    console.error('Error in submitWebsiteLead:', error);
    if (error.code === 11000) {
      // במקרה נדיר של מרוץ (duplicate key) נחזיר הודעה ידידותית
      return res.status(200).json({
        success: true,
        message: 'הפרטים נשמרו בהצלחה',
        data: { created: false, updated: true },
      });
    }
    return res.status(500).json({
      success: false,
      message: 'שגיאת שרת בשמירת הליד',
      error: error.message,
    });
  }
};

