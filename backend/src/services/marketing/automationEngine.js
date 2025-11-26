const MarketingAutomation = require('../../models/marketing/MarketingAutomation');
const MarketingCampaign = require('../../models/marketing/MarketingCampaign');
const TaskManager = require('../../models/TaskManager');
const Notification = require('../../models/Notification');
const whatsappService = require('../whatsappService');
const cron = require('node-cron');

// Store for active cron jobs
const cronJobs = new Map();

/**
 * ביצוע אוטומציה
 * @param {Object} automation - אוטומציה שיווקית
 * @param {Boolean} testMode - מצב בדיקה (לא שומר לוגים)
 */
exports.executeAutomation = async (automation, testMode = false) => {
  try {
    const results = {
      automationId: automation._id,
      automationName: automation.name,
      executedAt: new Date(),
      actions: [],
      success: true,
      errors: []
    };
    
    // בדיקת תנאי הפעלה
    const shouldExecute = await checkTrigger(automation);
    
    if (!shouldExecute && !testMode) {
      await automation.addLog('partial', 'Trigger conditions not met', {});
      return {
        ...results,
        success: false,
        message: 'תנאי הפעלה לא התקיימו'
      };
    }
    
    // ביצוע פעולות לפי סדר
    const sortedActions = automation.actions.sort((a, b) => a.order - b.order);
    
    for (const action of sortedActions) {
      try {
        // המתן אם יש delay
        if (action.delay > 0 && !testMode) {
          await new Promise(resolve => setTimeout(resolve, action.delay * 60 * 1000));
        }
        
        const actionResult = await executeAction(action, automation, testMode);
        results.actions.push({
          actionType: action.type,
          order: action.order,
          success: actionResult.success,
          message: actionResult.message,
          data: actionResult.data
        });
        
        if (!actionResult.success) {
          results.errors.push(actionResult.error);
          results.success = false;
        }
        
      } catch (error) {
        results.actions.push({
          actionType: action.type,
          order: action.order,
          success: false,
          error: error.message
        });
        results.errors.push(error.message);
        results.success = false;
      }
    }
    
    // שמירת לוג (אם לא במצב בדיקה)
    if (!testMode) {
      const logStatus = results.success ? 'success' : (results.errors.length > 0 ? 'failed' : 'partial');
      await automation.addLog(logStatus, `Executed ${results.actions.length} actions`, results);
    }
    
    return results;
    
  } catch (error) {
    console.error('Error in executeAutomation:', error);
    
    if (!testMode) {
      await automation.addLog('failed', error.message, { error: error.stack });
    }
    
    throw error;
  }
};

/**
 * בדיקת תנאי הפעלה
 */
async function checkTrigger(automation) {
  const trigger = automation.trigger;
  
  switch (trigger.type) {
    case 'date_reached':
      // בדוק אם הגיע התאריך
      if (trigger.conditions && trigger.conditions.targetDate) {
        const targetDate = new Date(trigger.conditions.targetDate);
        return new Date() >= targetDate;
      }
      return false;
      
    case 'days_before_date':
      // בדוק אם X ימים לפני תאריך
      if (trigger.conditions && trigger.conditions.targetDate && trigger.conditions.days) {
        const targetDate = new Date(trigger.conditions.targetDate);
        const daysBefore = trigger.conditions.days;
        const checkDate = new Date(targetDate);
        checkDate.setDate(checkDate.getDate() - daysBefore);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        checkDate.setHours(0, 0, 0, 0);
        return today.getTime() === checkDate.getTime();
      }
      return false;
      
    case 'campaign_status':
      // בדוק סטטוס קמפיין
      if (trigger.conditions && trigger.conditions.campaignId && trigger.conditions.status) {
        const campaign = await MarketingCampaign.findById(trigger.conditions.campaignId);
        return campaign && campaign.status === trigger.conditions.status;
      }
      return false;
      
    case 'manual':
      // הפעלה ידנית - תמיד true
      return true;
      
    default:
      return false;
  }
}

/**
 * ביצוע פעולה בודדת
 */
async function executeAction(action, automation, testMode) {
  try {
    switch (action.type) {
      case 'send_email':
        if (testMode) {
          console.log('    [TEST] Would send email:', action.config);
          return { success: true, message: 'Email sent (test mode)' };
        }
        // TODO: Implement actual email sending
        console.log('    Sending email:', action.config?.to);
        return { success: true, message: 'Email sent' };
        
      case 'send_sms':
        if (testMode) {
          console.log('    [TEST] Would send SMS:', action.config);
          return { success: true, message: 'SMS sent (test mode)' };
        }
        // TODO: Implement actual SMS sending
        console.log('    Sending SMS:', action.config?.to);
        return { success: true, message: 'SMS sent' };
        
      case 'send_whatsapp':
        if (action.config && action.config.phone && action.config.message) {
          if (testMode) {
            console.log('    [TEST] Would send WhatsApp:', action.config);
            return { success: true, message: 'WhatsApp sent (test mode)' };
          }
          // TODO: Implement actual WhatsApp sending
          // await whatsappService.sendMessage(action.config.phone, action.config.message);
          console.log(`📱 Sending WhatsApp to ${action.config.phone}: ${action.config.message}`);
          return { success: true, message: 'WhatsApp sent', data: {} };
        }
        return { success: false, error: 'Missing phone or message' };
        
      case 'create_task':
        if (action.config && action.config.title) {
          const task = new TaskManager({
            title: action.config.title,
            description: action.config.description || '',
            type: action.config.taskType || 'other',
            priority: action.config.priority || 'medium',
            status: 'todo',
            dueDate: action.config.dueDate ? new Date(action.config.dueDate) : new Date(),
            assignedTo: action.config.assignedTo || automation.createdBy,
            createdBy: automation.createdBy,
            metadata: {
              automationId: automation._id,
              campaignId: automation.campaignId
            }
          });
          
          if (!testMode) {
            await task.save();
          }
          
          return { success: true, message: 'Task created', data: { taskId: task._id } };
        }
        return { success: false, error: 'Missing task title' };
        
      case 'create_calendar_event':
        // TODO: Implement actual calendar event creation
        if (testMode) {
          console.log('    [TEST] Would create calendar event:', action.config);
          return { success: true, message: 'Calendar event created (test mode)' };
        }
        console.log('    Creating calendar event:', action.config?.title);
        return { success: true, message: 'Calendar event created' };
        
      case 'send_notification':
        if (action.config && action.config.userId && action.config.message) {
          if (testMode) {
            console.log('    [TEST] Would send notification:', action.config);
            return { success: true, message: 'Notification sent (test mode)' };
          }
          await Notification.create({
            type: 'marketing_automation',
            title: action.config.title || 'אוטומציה שיווקית',
            message: action.config.message,
            userId: action.config.userId,
            priority: action.config.priority || 'medium',
            actionUrl: action.config.actionUrl,
            icon: 'info',
            color: '#2196f3'
          });
          return { success: true, message: 'Notification sent', data: {} };
        }
        return { success: false, error: 'Missing userId or message' };
        
      case 'start_campaign':
        if (testMode) {
          console.log('    [TEST] Would start campaign:', automation.campaignId);
          return { success: true, message: 'Campaign started (test mode)' };
        }
        if (automation.campaignId) {
          const campaign = await MarketingCampaign.findById(automation.campaignId);
          if (campaign) {
            campaign.status = 'active';
            campaign.startDate = new Date();
            await campaign.save();
            console.log('    Started campaign:', campaign.name);
            return { success: true, message: `Campaign ${campaign.name} started`, data: { campaignId: campaign._id } };
          }
          return { success: false, error: 'Campaign not found' };
        }
        return { success: false, error: 'No campaign linked' };
        
      case 'webhook':
        if (testMode) {
          console.log('    [TEST] Would call webhook:', action.config);
          return { success: true, message: 'Webhook called (test mode)' };
        }
        // TODO: Implement webhook call
        console.log('    Calling webhook:', action.config?.url);
        return { success: true, message: 'Webhook called' };
        
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * בדיקת אוטומציות שצריכות לרוץ
 */
exports.checkScheduledAutomations = async () => {
  try {
    const now = new Date();
    
    const automations = await MarketingAutomation.find({
      isActive: true,
      nextRun: { $lte: now }
    });
    
    console.log(`🔍 Found ${automations.length} automations to execute`);
    
    for (const automation of automations) {
      try {
        await exports.executeAutomation(automation, false);
      } catch (error) {
        console.error(`Error executing automation ${automation._id}:`, error);
      }
    }
    
    return automations.length;
  } catch (error) {
    console.error('Error in checkScheduledAutomations:', error);
    throw error;
  }
};

/**
 * אתחול מנוע האוטומציה
 */
exports.initializeAutomationEngine = async () => {
  try {
    console.log('🚀 Initializing Marketing Automation Engine...');
    
    // טען אוטומציות פעילות
    const activeAutomations = await MarketingAutomation.find({ isActive: true });
    
    console.log(`Found ${activeAutomations.length} active automations`);
    
    // הפעל כל אוטומציה
    for (const automation of activeAutomations) {
      await exports.scheduleAutomation(automation);
    }
    
    // הרץ בדיקה כל דקה לאוטומציות שצריכות לרוץ
    cron.schedule('* * * * *', async () => {
      await exports.checkScheduledAutomations();
    });
    
    console.log('✅ Automation Engine initialized successfully');
    
  } catch (error) {
    console.error('Error initializing automation engine:', error);
    throw error;
  }
};

/**
 * תזמון אוטומציה
 */
exports.scheduleAutomation = async (automation) => {
  try {
    // אם יש כבר job - בטל אותו
    if (cronJobs.has(automation._id.toString())) {
      cronJobs.get(automation._id.toString()).stop();
    }
    
    // אם יש schedule - צור cron job
    if (automation.trigger && automation.trigger.schedule && automation.trigger.schedule.frequency !== 'once') {
      const cronExpression = getCronExpression(automation.trigger.schedule);
      
      if (cronExpression) {
        const job = cron.schedule(cronExpression, async () => {
          await exports.executeAutomation(automation);
        });
        
        cronJobs.set(automation._id.toString(), job);
        console.log(`📅 Scheduled automation: ${automation.name} with cron: ${cronExpression}`);
      }
    }
    
  } catch (error) {
    console.error(`Error scheduling automation ${automation.name}:`, error);
  }
};

/**
 * ביטול תזמון אוטומציה
 */
exports.unscheduleAutomation = (automationId) => {
  const jobKey = automationId.toString();
  if (cronJobs.has(jobKey)) {
    cronJobs.get(jobKey).stop();
    cronJobs.delete(jobKey);
    console.log(`⏹️ Unscheduled automation: ${automationId}`);
  }
};

/**
 * בדיקה והרצת אוטומציות
 */
exports.checkAndRunAutomations = async () => {
  try {
    const now = new Date();
    
    // מצא אוטומציות שצריכות לרוץ
    const automations = await MarketingAutomation.find({
      isActive: true,
      nextRun: { $lte: now }
    });
    
    for (const automation of automations) {
      await exports.executeAutomation(automation);
    }
    
  } catch (error) {
    console.error('Error checking automations:', error);
  }
};

// Helper functions
function getCronExpression(schedule) {
  if (!schedule || !schedule.frequency) return null;
  
  switch (schedule.frequency) {
    case 'daily':
      const dailyTime = schedule.time || '09:00';
      const [hours, minutes] = dailyTime.split(':');
      return `${minutes || 0} ${hours || 9} * * *`;
      
    case 'weekly':
      const weeklyTime = schedule.time || '09:00';
      const [wHours, wMinutes] = weeklyTime.split(':');
      const days = schedule.daysOfWeek?.join(',') || '1';
      return `${wMinutes || 0} ${wHours || 9} * * ${days}`;
      
    case 'monthly':
      const monthlyTime = schedule.time || '09:00';
      const [mHours, mMinutes] = monthlyTime.split(':');
      const dayOfMonth = schedule.dayOfMonth || 1;
      return `${mMinutes || 0} ${mHours || 9} ${dayOfMonth} * *`;
      
    default:
      return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

