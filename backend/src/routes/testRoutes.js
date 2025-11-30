// backend/src/routes/testRoutes.js
const express = require('express');
const router = express.Router();

// בדיקה ידנית של Lead Nurturing
router.get('/run-nurturing', async (req, res) => {
  try {
    console.log('🧪 Running manual Lead Nurturing check...');
    
    const leadNurturingService = require('../services/leadNurturingService');
    
    await leadNurturingService.checkTriggers();
    await leadNurturingService.executeScheduledActions();
    
    res.json({
      success: true,
      message: 'Manual check completed. Check server logs for details.'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// בדיקה ידנית של Reminders
router.get('/run-reminders', async (req, res) => {
  try {
    console.log('🧪 Running manual Reminder check...');
    
    const reminderService = require('../services/reminderService');
    await reminderService.runManualCheck();
    
    res.json({
      success: true,
      message: 'Manual check completed. Check server logs for details.'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// סטטוס אוטומציות
router.get('/automation-status', (req, res) => {
  try {
    const reminderService = require('../services/reminderService');
    const leadNurturingService = require('../services/leadNurturingService');
    
    res.json({
      success: true,
      data: {
        reminderService: {
          active: reminderService.jobs && reminderService.jobs.length > 0,
          jobCount: reminderService.jobs ? reminderService.jobs.length : 0
        },
        leadNurturingService: {
          active: leadNurturingService.jobs && leadNurturingService.jobs.length > 0,
          jobCount: leadNurturingService.jobs ? leadNurturingService.jobs.length : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// בדיקת לידים חדשים
router.get('/check-new-leads', async (req, res) => {
  try {
    const Client = require('../models/Client');
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const newLeads = await Client.find({
      status: 'lead',
      'metadata.createdAt': { $gte: oneDayAgo }
    }).select('personalInfo businessInfo leadSource leadScore metadata.createdAt');
    
    res.json({
      success: true,
      count: newLeads.length,
      data: newLeads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// בדיקת instances פעילים
router.get('/check-instances', async (req, res) => {
  try {
    const LeadNurturingInstance = require('../models/LeadNurturingInstance');
    
    const instances = await LeadNurturingInstance.find({ status: 'active' })
      .populate('nurturingTemplate', 'name')
      .populate('client', 'personalInfo');
    
    res.json({
      success: true,
      count: instances.length,
      data: instances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;




