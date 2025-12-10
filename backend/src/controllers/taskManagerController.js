// backend/src/controllers/taskManagerController.js
const TaskManager = require('../models/TaskManager');
const Notification = require('../models/Notification');
const Client = require('../models/Client');
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
      projectId,
      from,
      to,
      sortBy = '-dueDate'
    } = req.query;

    let query = {};

    // פילטר לפי סטטוס
    if (status) {
      // אם status הוא 'all' או 'active', נטפל בהתאם
      if (status === 'all') {
        // לא נסנן לפי סטטוס - נחזיר הכל
      } else if (status === 'active') {
        // רק משימות פעילות (לא הושלמו ולא בוטלו)
        query.status = { $nin: ['completed', 'cancelled'] };
      } else {
        // סטטוס ספציפי
        query.status = status;
      }
    }
    // אם אין פרמטר status, נחזיר את כל המשימות (כולל הושלמו)
    // כך ש-TaskBoard יוכל לסנן אותן בצד הלקוח

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
      // ברירת מחדל: אם יש userId תקין – רק משימות שלי,
      // אבל אם מסננים לפי projectId – מציגים את כל משימות הפרויקט (גם אם לא הוקצו למשתמש)
      if (!projectId && isValidObjectId(req.user?.id || req.user?._id)) {
        query.assignedTo = req.user.id;
      }
    }

    // פילטר לפי פרויקט
    if (projectId && isValidObjectId(projectId)) {
      query.projectId = projectId;
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

    // פילטר לפי טווח תאריכים מפורש (from/to)
    if (from || to) {
      const range = {};
      if (from) {
        range.$gte = new Date(from);
      }
      if (to) {
        range.$lte = new Date(to);
      }
      query.dueDate = range;
    }

    // פילטר לפי תגיות
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const tasks = await TaskManager.find(query)
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('projectId', 'name status color')
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
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('projectId', 'name status color');

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
    const rawUserId = req.user?.id || req.user?._id;
    const safeUserId = isValidObjectId(rawUserId) ? rawUserId : null;

    const taskData = {
      ...req.body,
      createdBy: safeUserId,
      assignedTo: req.body.assignedTo || safeUserId
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
      // בדוק אם יש assignedTo תקין לפני יצירת התראה
      const assignedUserId = task.assignedTo || task.createdBy || req.user?.id || req.user?._id;
      if (isValidObjectId(assignedUserId)) {
        try {
          await Notification.create({
            type: 'achievement',
            title: '🎉 משימה הושלמה!',
            message: `סיימת את המשימה: ${task.title}`,
            userId: assignedUserId,
            relatedTask: task._id,
            priority: 'low',
            icon: 'check_circle',
            color: '#4caf50'
          });
        } catch (notifError) {
          // לוג שגיאה אבל אל תכשיל את העדכון
          console.error('Error creating notification:', notifError);
        }
      }
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
    const hasValidUser = isValidObjectId(req.user?.id || req.user?._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // משימות להיום:
    // 1. כאלה שה-dueDate שלהן היום
    // 2. כאלה ללא dueDate אבל נוצרו היום (metadata.createdAt)
    const todayBaseFilter = {
      status: { $nin: ['completed', 'cancelled'] },
      ...(hasValidUser ? { assignedTo: req.user.id } : {}),
      $or: [
        {
          dueDate: { $gte: today, $lte: endOfToday }
        },
        {
          $and: [
            {
              $or: [
                { dueDate: { $exists: false } },
                { dueDate: null }
              ]
            },
            { 'metadata.createdAt': { $gte: today, $lte: endOfToday } }
          ]
        }
      ]
    };

    const todayTasks = await TaskManager.find(todayBaseFilter)
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('projectId', 'name color status')
      .sort('dueDate priority');

    // משימות באיחור
    const overdueFilter = {
      dueDate: { $lt: today },
      status: { $nin: ['completed', 'cancelled'] },
      ...(hasValidUser ? { assignedTo: req.user.id } : {})
    };

    const overdueTasks = await TaskManager.find(overdueFilter)
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('projectId', 'name color status')
      .sort('dueDate');

    // משימות דחופות (בלי תאריך או היום)
    const urgentFilter = {
      priority: 'urgent',
      status: { $nin: ['completed', 'cancelled'] },
      ...(hasValidUser ? { assignedTo: req.user.id } : {})
    };

    const urgentTasks = await TaskManager.find(urgentFilter)
      .populate('relatedClient', 'personalInfo businessInfo')
      .limit(5);

    // התראות לא נקראו
    const unreadNotifications = hasValidUser
      ? await Notification.find({
        userId: req.user.id,
        read: false
      })
        .sort('-createdAt')
        .limit(10)
      : [];

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
    const hasValidUser = isValidObjectId(req.user?.id || req.user?._id);

    // טווח בסיס של החודש הנבחר
    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // הוספת buffer של שבוע לפני ואחרי החודש
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + 7);

    // משימות לפי משתמש מחובר (אם ה-id תקין), אחרת ללא סינון לפי assignedTo
    // כולל משימות שה-dueDate או ה-startDate שלהן בתוך טווח החודש
    let tasks = [];
    const tasksByDate = {};

    const taskFilter = {
      $or: [
        { dueDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $gte: startDate, $lte: endDate } }
      ],
      ...(hasValidUser ? { assignedTo: req.user.id } : {})
    };

    tasks = await TaskManager.find(taskFilter)
      .populate('relatedClient', 'personalInfo businessInfo')
      .populate('projectId', 'name color status')
      .sort('dueDate');

    tasks.forEach(task => {
      const baseDate = task.startDate || task.dueDate;
      if (!baseDate) return;
      const dateKey = new Date(baseDate).toISOString().split('T')[0];
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

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

// משימות לפי יום (לקבוצת Today / by-day)
exports.getTasksByDay = async (req, res) => {
  try {
    const { date, projectId } = req.query;

    if (!isValidObjectId(req.user.id)) {
      return res.json({
        success: true,
        data: {
          tasks: [],
          groupedByProject: {}
        }
      });
    }

    const baseDate = date ? new Date(date) : new Date();
    baseDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      assignedTo: req.user.id,
      status: { $nin: ['completed', 'cancelled'] },
      dueDate: { $gte: baseDate, $lte: endOfDay }
    };

    if (projectId && isValidObjectId(projectId)) {
      query.projectId = projectId;
    }

    const tasks = await TaskManager.find(query)
      .populate('projectId', 'name color status')
      .populate('relatedClient', 'personalInfo businessInfo')
      .sort('dueDate priority');

    const groupedByProject = {};
    tasks.forEach(task => {
      const key = task.projectId ? String(task.projectId._id) : 'no_project';
      if (!groupedByProject[key]) {
        groupedByProject[key] = {
          project: task.projectId || null,
          tasks: []
        };
      }
      groupedByProject[key].tasks.push(task);
    });

    res.json({
      success: true,
      data: {
        date: baseDate.toISOString(),
        tasks,
        groupedByProject
      }
    });
  } catch (error) {
    console.error('Error in getTasksByDay:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת משימות ליום',
      error: error.message
    });
  }
};

// תצוגת Gantt – מציג *כל* המשימות של המשתמש (גם מרכזיות וגם משימות לקוח) בקיבוץ לפי פרויקט / לקוח
exports.getGanttView = async (req, res) => {
  try {
    const { from, to, projectId } = req.query;

    // בלי משתמש תקין – אין טעם להחזיר נתונים
    if (!isValidObjectId(req.user?.id)) {
      return res.json({
        success: true,
        data: {
          range: { from, to },
          projects: []
        }
      });
    }

    const userId = req.user.id;

    // טווח תאריכים לבניה של הציר
    const start = from ? new Date(from) : new Date();
    const end =
      to ? new Date(to) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 יום

    // פונקציה עזר – בודקת אם טווח משימה חותך את הטווח הנבחר
    const isInRange = (taskStart, taskEnd) => {
      if (!taskStart && !taskEnd) return true; // משימה בלי תאריכים – נציג אותה
      const s = taskStart ? new Date(taskStart) : new Date(taskEnd);
      const e = taskEnd ? new Date(taskEnd) : new Date(taskStart);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return true;
      return (
        (s >= start && s <= end) ||
        (e >= start && e <= end) ||
        (s <= start && e >= end)
      );
    };

    const projectsMap = {};

    const addTaskToProject = (projectKey, projectData, task) => {
      if (!projectsMap[projectKey]) {
        projectsMap[projectKey] = {
          project: projectData,
          tasks: []
        };
      }
      projectsMap[projectKey].tasks.push(task);
    };

    //
    // 1. משימות מרכזיות (TaskManager)
    //
    const centralQuery = {
      assignedTo: userId,
      status: { $nin: ['cancelled'] }
    };

    // סינון לפי פרויקט רלוונטי רק למשימות מרכזיות
    if (projectId && isValidObjectId(projectId)) {
      centralQuery.projectId = projectId;
    }

    const centralTasks = await TaskManager.find(centralQuery)
      .populate('projectId', 'name color status')
      .sort('startDate dueDate')
      .lean();

    centralTasks.forEach((task) => {
      const taskStart = task.startDate || task.dueDate || task.endDate;
      const taskEnd = task.endDate || task.dueDate || task.startDate;

      if (!isInRange(taskStart, taskEnd)) {
        return;
      }

      const projectKey = task.projectId
        ? String(task.projectId._id || task.projectId)
        : 'no_project';

      const projectData = task.projectId || {
        _id: 'no_project',
        name: 'ללא פרויקט',
        color: '#9e9e9e',
        status: 'active'
      };

      const startTime = taskStart || start;
      const endTime = taskEnd || startTime;

      addTaskToProject(projectKey, projectData, {
        _id: task._id,
        title: task.title,
        startDate: startTime,
        endDate: endTime,
        status: task.status,
        priority: task.priority,
        color: task.color,
        projectId: task.projectId ? (task.projectId._id || task.projectId) : null
      });
    });

    //
    // 2. משימות לקוח מוטמעות (Client.tasks) – יוצגו רק כאשר אין סינון לפי projectId
    //
    if (!projectId) {
      const clientQuery = {
        'tasks.status': { $ne: 'cancelled' },
        'tasks.assignedTo': userId
      };

      const clientsWithTasks = await Client.find(clientQuery)
        .select('personalInfo businessInfo tasks')
        .lean();

      clientsWithTasks.forEach((client) => {
        const clientName =
          (client.personalInfo?.fullName || '') &&
          (client.businessInfo?.businessName
            ? `${client.personalInfo.fullName} - ${client.businessInfo.businessName}`
            : client.personalInfo.fullName);

        const projectKey = `client_${client._id}`;
        const projectData = {
          _id: projectKey,
          name: clientName || 'לקוח ללא שם',
          color: '#4caf50',
          status: 'active'
        };

        (client.tasks || []).forEach((task) => {
          if (String(task.assignedTo || '') !== String(userId)) return;
          if (task.status === 'cancelled') return;

          // במשימות לקוח יש לנו dueDate ו-createdAt – נשתמש ב-dueDate כברירת מחדל
          const taskStart = task.dueDate || task.createdAt;
          const taskEnd = task.dueDate || task.createdAt;

          if (!isInRange(taskStart, taskEnd)) {
            return;
          }

          const startTime = taskStart || start;
          const endTime = taskEnd || startTime;

          addTaskToProject(projectKey, projectData, {
            _id: task._id || task._id?.toString?.() || `${client._id}_${task.createdAt?.getTime?.() || Math.random()}`,
            title: task.title,
            startDate: startTime,
            endDate: endTime,
            status: task.status,
            priority: task.priority,
            color: '#4caf50',
            // אין projectId אמיתי – זו משימת לקוח
            projectId: null
          });
        });
      });
    }

    const projectsArray = Object.values(projectsMap);

    return res.json({
      success: true,
      data: {
        range: {
          from: start.toISOString(),
          to: end.toISOString()
        },
        projects: projectsArray
      }
    });
  } catch (error) {
    console.error('Error in getGanttView:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת לוח גאנט',
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

