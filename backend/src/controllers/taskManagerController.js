// backend/src/controllers/taskManagerController.js
const TaskManager = require('../models/TaskManager');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

// קבלת כל המשימות (עם פילטרים)
exports.getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      type,
      assignedTo,
      date, // today, tomorrow, this_week, overdue
      tags,
      sortBy = '-dueDate'
    } = req.query;

    let query = {};

    // פילטר לפי סטטוס
    if (status) {
      query.status = status;
    } else {
      // ברירת מחדל: לא מראה משימות שבוטלו או הושלמו
      query.status = { $nin: ['completed', 'cancelled'] };
    }

    // פילטר לפי עדיפות
    if (priority) {
      query.priority = priority;
    }

    // פילטר לפי סוג
    if (type) {
      query.type = type;
    }

    // פילטר לפי משתמש מוקצה
    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else {
      // ברירת מחדל: רק משימות שלי
      if (isValidObjectId(req.user.id)) {
        query.assignedTo = req.user.id;
      } else {
        // אם userId לא תקין, נחזיר רשימה ריקה
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }
    }

    // פילטר לפי תאריך
    if (date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      switch (date) {
        case 'today':
          const endOfToday = new Date(now);
          endOfToday.setHours(23, 59, 59, 999);
          query.dueDate = { $gte: now, $lte: endOfToday };
          break;

        case 'tomorrow':
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          query.dueDate = { $gte: tomorrow, $lte: endOfTomorrow };
          break;

        case 'this_week':
          const endOfWeek = new Date(now);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          query.dueDate = { $gte: now, $lte: endOfWeek };
          break;

        case 'overdue':
          query.dueDate = { $lt: now };
          break;
      }
    }

    // פילטר לפי תגיות
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const tasks = await TaskManager.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('relatedClient', 'personalInfo businessInfo')
      .sort(sortBy);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Error in getAllTasks:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת המשימות',
      error: error.message
    });
  }
};

// קבלת משימה בודדת
exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskManager.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('updates.updatedBy', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'משימה לא נמצאה'
      });
    }

    // עדכון צפייה
    task.metadata.viewCount += 1;
    task.metadata.lastViewedAt = new Date();
    await task.save();

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Error in getTaskById:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת המשימה',
      error: error.message
    });
  }
};

// יצירת משימה חדשה
exports.createTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'משתמש לא תקין'
      });
    }

    const taskData = {
      ...req.body,
      createdBy: req.user.id,
      assignedTo: req.body.assignedTo || req.user.id
    };

    const task = new TaskManager(taskData);
    await task.save();

    // אם המשימה הוקצתה למשתמש אחר, שלח התראה
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id.toString()) {
      await Notification.create({
        type: 'task_assigned',
        title: 'משימה חדשה הוקצתה לך',
        message: `${req.user.name || 'משתמש'} הקצה לך את המשימה: ${task.title}`,
        userId: task.assignedTo,
        relatedTask: task._id,
        priority: task.priority,
        actionUrl: `/admin/tasks/${task._id}`,
        actionText: 'צפה במשימה',
        icon: 'assignment',
        color: task.color
      });
    }

    res.status(201).json({
      success: true,
      message: 'משימה נוצרה בהצלחה',
      data: task
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

// עדכון משימה
exports.updateTask = async (req, res) => {
  try {
    const task = await TaskManager.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'משימה לא נמצאה'
      });
    }

    // שמור סטטוס ישן
    const oldStatus = task.status;

    // עדכון שדות
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy') {
        task[key] = req.body[key];
      }
    });

    await task.save();

    // אם הסטטוס השתנה ל-completed, שלח התראה
    if (oldStatus !== 'completed' && task.status === 'completed') {
      await Notification.create({
        type: 'achievement',
        title: '🎉 משימה הושלמה!',
        message: `סיימת את המשימה: ${task.title}`,
        userId: task.assignedTo,
        priority: 'low',
        icon: 'check_circle',
        color: '#4caf50'
      });
    }

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

// מחיקת משימה
exports.deleteTask = async (req, res) => {
  try {
    const task = await TaskManager.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'משימה לא נמצאה'
      });
    }

    res.json({
      success: true,
      message: 'משימה נמחקה בהצלחה'
    });

  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת המשימה',
      error: error.message
    });
  }
};

// קבלת "Today's Agenda"
exports.getTodayAgenda = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.json({
        success: true,
        data: {
          today: [],
          overdue: [],
          urgent: [],
          notifications: [],
          summary: {
            todayCount: 0,
            overdueCount: 0,
            urgentCount: 0,
            unreadCount: 0
          }
        }
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // משימות להיום
    const todayTasks = await TaskManager.find({
      assignedTo: req.user.id,
      dueDate: { $gte: today, $lte: endOfToday },
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('relatedClient', 'personalInfo businessInfo')
      .sort('dueDate priority');

    // משימות באיחור
    const overdueTasks = await TaskManager.find({
      assignedTo: req.user.id,
      dueDate: { $lt: today },
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('relatedClient', 'personalInfo businessInfo')
      .sort('dueDate');

    // משימות דחופות (בלי תאריך או היום)
    const urgentTasks = await TaskManager.find({
      assignedTo: req.user.id,
      priority: 'urgent',
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('relatedClient', 'personalInfo businessInfo')
      .limit(5);

    // התראות לא נקראו
    const unreadNotifications = await Notification.find({
      userId: req.user.id,
      read: false
    })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      data: {
        today: todayTasks,
        overdue: overdueTasks,
        urgent: urgentTasks,
        notifications: unreadNotifications,
        summary: {
          todayCount: todayTasks.length,
          overdueCount: overdueTasks.length,
          urgentCount: urgentTasks.length,
          unreadCount: unreadNotifications.length
        }
      }
    });

  } catch (error) {
    console.error('Error in getTodayAgenda:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת סדר היום',
      error: error.message
    });
  }
};

// קבלת תצוגת קלנדר
exports.getCalendarView = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // משימות לפי משתמש מחובר (אם ה-id תקין), אחרת החזר ללא משימות
    let tasks = [];
    const tasksByDate = {};

    if (isValidObjectId(req.user.id)) {
      tasks = await TaskManager.find({
        assignedTo: req.user.id,
        dueDate: { $gte: startDate, $lte: endDate }
      })
        .populate('relatedClient', 'personalInfo businessInfo')
        .sort('dueDate');

      tasks.forEach(task => {
        if (!task.dueDate) return;
        const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      });
    }

    // אינטראקציות עם nextFollowUp בטווח התאריכים
    const Client = require('../models/Client');

    const clients = await Client.find({
      'interactions.nextFollowUp': { $gte: startDate, $lte: endDate }
    }).select('personalInfo businessInfo interactions');

    const interactionsByDate = {};

    clients.forEach(client => {
      (client.interactions || []).forEach(interaction => {
        if (!interaction.nextFollowUp) return;
        const ts = new Date(interaction.nextFollowUp);
        if (ts < startDate || ts > endDate) return;

        const dateKey = ts.toISOString().split('T')[0];
        if (!interactionsByDate[dateKey]) {
          interactionsByDate[dateKey] = [];
        }

        interactionsByDate[dateKey].push({
          _id: interaction._id,
          type: interaction.type,
          direction: interaction.direction,
          subject: interaction.subject,
          content: interaction.content,
          nextFollowUp: interaction.nextFollowUp,
          clientId: client._id,
          clientName: client.personalInfo?.fullName,
          clientBusiness: client.businessInfo?.businessName
        });
      });
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        tasks: tasksByDate,
        interactions: interactionsByDate,
        totalTasks: tasks.length
      }
    });

  } catch (error) {
    console.error('Error in getCalendarView:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת היומן',
      error: error.message
    });
  }
};

// סטטיסטיקות
exports.getTaskStats = async (req, res) => {
  try {
    if (!isValidObjectId(req.user.id)) {
      return res.json({
        success: true,
        data: {
          total: 0,
          byStatus: { todo: 0, in_progress: 0, waiting: 0, completed: 0 },
          byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
          overdue: 0,
          completedToday: 0,
          completedThisWeek: 0,
          completionRate: 0
        }
      });
    }

    const userId = req.user.id;

    const stats = {
      total: await TaskManager.countDocuments({ assignedTo: userId }),
      
      byStatus: {
        todo: await TaskManager.countDocuments({ assignedTo: userId, status: 'todo' }),
        in_progress: await TaskManager.countDocuments({ assignedTo: userId, status: 'in_progress' }),
        waiting: await TaskManager.countDocuments({ assignedTo: userId, status: 'waiting' }),
        completed: await TaskManager.countDocuments({ assignedTo: userId, status: 'completed' })
      },

      byPriority: {
        urgent: await TaskManager.countDocuments({ assignedTo: userId, priority: 'urgent', status: { $nin: ['completed', 'cancelled'] } }),
        high: await TaskManager.countDocuments({ assignedTo: userId, priority: 'high', status: { $nin: ['completed', 'cancelled'] } }),
        medium: await TaskManager.countDocuments({ assignedTo: userId, priority: 'medium', status: { $nin: ['completed', 'cancelled'] } }),
        low: await TaskManager.countDocuments({ assignedTo: userId, priority: 'low', status: { $nin: ['completed', 'cancelled'] } })
      },

      overdue: await TaskManager.countDocuments({
        assignedTo: userId,
        dueDate: { $lt: new Date() },
        status: { $nin: ['completed', 'cancelled'] }
      }),

      completedToday: await TaskManager.countDocuments({
        assignedTo: userId,
        status: 'completed',
        completedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),

      completedThisWeek: await TaskManager.countDocuments({
        assignedTo: userId,
        status: 'completed',
        completedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    };

    // חישוב completion rate
    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.byStatus.completed / stats.total) * 100);
    } else {
      stats.completionRate = 0;
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getTaskStats:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הסטטיסטיקות',
      error: error.message
    });
  }
};

module.exports = exports;

