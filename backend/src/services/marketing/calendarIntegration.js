const TaskManager = require('../../models/TaskManager');
const MarketingCampaign = require('../../models/marketing/MarketingCampaign');

/**
 * יצירת משימות אוטומטיות עבור קמפיין
 * @param {Object} campaign - קמפיין שיווקי
 */
exports.createTasksForCampaign = async (campaign) => {
  try {
    const tasks = [];
    
    // משימה 1: תכנון קמפיין
    if (campaign.preparationDays && campaign.targetDate) {
      const preparationStartDate = new Date(campaign.targetDate);
      preparationStartDate.setDate(preparationStartDate.getDate() - campaign.preparationDays);
      
      tasks.push({
        title: `תכנון קמפיין: ${campaign.name}`,
        description: `תכנון מפורט לקמפיין ${campaign.type}`,
        dueDate: preparationStartDate,
        priority: 'high',
        status: 'todo',
        type: 'marketing_campaign',
        assignedTo: campaign.createdBy,
        createdBy: campaign.createdBy,
        metadata: {
          campaignId: campaign._id,
          campaignName: campaign.name,
          step: 'planning'
        }
      });
    }
    
    // משימה 2: יצירת תוכן
    if (campaign.preparationDays && campaign.targetDate) {
      const contentDate = new Date(campaign.targetDate);
      contentDate.setDate(contentDate.getDate() - Math.floor(campaign.preparationDays * 0.7));
      
      tasks.push({
        title: `יצירת תוכן: ${campaign.name}`,
        description: 'כתיבה ועיצוב של תוכן הקמפיין',
        dueDate: contentDate,
        priority: 'high',
        status: 'todo',
        type: 'marketing_campaign',
        assignedTo: campaign.createdBy,
        createdBy: campaign.createdBy,
        metadata: {
          campaignId: campaign._id,
          campaignName: campaign.name,
          step: 'content_creation'
        }
      });
    }
    
    // משימה 3: אישור תוכן
    if (campaign.preparationDays && campaign.targetDate) {
      const approvalDate = new Date(campaign.targetDate);
      approvalDate.setDate(approvalDate.getDate() - Math.floor(campaign.preparationDays * 0.5));
      
      tasks.push({
        title: `אישור תוכן: ${campaign.name}`,
        description: 'בדיקה ואישור סופי של תוכן הקמפיין',
        dueDate: approvalDate,
        priority: 'medium',
        status: 'todo',
        type: 'marketing_campaign',
        assignedTo: campaign.createdBy,
        createdBy: campaign.createdBy,
        metadata: {
          campaignId: campaign._id,
          campaignName: campaign.name,
          step: 'approval'
        }
      });
    }
    
    // משימה 4: הפעלת קמפיין
    if (campaign.targetDate) {
      const launchDate = new Date(campaign.targetDate);
      launchDate.setDate(launchDate.getDate() - 1);
      
      tasks.push({
        title: `הפעלת קמפיין: ${campaign.name}`,
        description: 'הפעלה והשקה של הקמפיין',
        dueDate: launchDate,
        priority: 'high',
        status: 'todo',
        type: 'marketing_campaign',
        assignedTo: campaign.createdBy,
        createdBy: campaign.createdBy,
        metadata: {
          campaignId: campaign._id,
          campaignName: campaign.name,
          step: 'launch'
        }
      });
    }
    
    // משימה 5: מעקב וניתוח
    if (campaign.targetDate) {
      const followUpDate = new Date(campaign.targetDate);
      followUpDate.setDate(followUpDate.getDate() + 3);
      
      tasks.push({
        title: `מעקב אחר קמפיין: ${campaign.name}`,
        description: 'ניתוח ביצועים ומסקנות',
        dueDate: followUpDate,
        priority: 'medium',
        status: 'todo',
        type: 'marketing_campaign',
        assignedTo: campaign.createdBy,
        createdBy: campaign.createdBy,
        metadata: {
          campaignId: campaign._id,
          campaignName: campaign.name,
          step: 'follow_up'
        }
      });
    }
    
    // יצירת המשימות במסד הנתונים
    if (tasks.length > 0) {
      const createdTasks = await TaskManager.insertMany(tasks);
      
      // עדכון הקמפיין עם task IDs
      campaign.tasks = createdTasks.map(t => ({
        taskId: t._id,
        status: t.status,
        dueDate: t.dueDate
      }));
      
      await campaign.save();
      
      console.log(`✅ Created ${createdTasks.length} tasks for campaign: ${campaign.name}`);
      return createdTasks;
    }
    
    return [];
    
  } catch (error) {
    console.error('Error in createTasksForCampaign:', error);
    throw error;
  }
};

/**
 * יצירת אירוע ביומן
 * @param {Object} campaign - קמפיין שיווקי
 */
exports.createCalendarEvent = async (campaign) => {
  try {
    const event = {
      title: campaign.name,
      description: `קמפיין ${campaign.type} - ${campaign.content?.headline || ''}`,
      startDate: campaign.targetDate,
      endDate: campaign.endDate || campaign.targetDate,
      type: 'marketing_campaign',
      metadata: {
        campaignId: campaign._id,
        campaignType: campaign.type
      }
    };
    
    // TODO: Create actual calendar event in your system
    // For now, we can create a task that acts as a calendar event
    const calendarTask = new TaskManager({
      title: `📅 ${event.title}`,
      description: event.description,
      type: 'marketing_campaign',
      priority: 'high',
      status: 'todo',
      dueDate: event.startDate,
      assignedTo: campaign.createdBy,
      createdBy: campaign.createdBy,
      metadata: {
        ...event.metadata,
        isCalendarEvent: true
      }
    });
    
    await calendarTask.save();
    
    console.log('📅 Calendar event created:', event.title);
    return event;
    
  } catch (error) {
    console.error('Error in createCalendarEvent:', error);
    throw error;
  }
};

/**
 * עדכון משימות קיימות של קמפיין
 * @param {Object} campaign - קמפיין שיווקי
 */
exports.updateCampaignTasks = async (campaign) => {
  try {
    // TODO: Implement task updates when campaign changes
    // For now, just log
    console.log(`Updating tasks for campaign: ${campaign.name}`);
    
    // אפשר למחוק משימות ישנות וליצור חדשות
    // או לעדכן את התאריכים של המשימות הקיימות
    
    return [];
  } catch (error) {
    console.error('Error in updateCampaignTasks:', error);
    throw error;
  }
};

