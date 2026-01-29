const Client = require('../models/Client');
const leadNurturingService = require('../services/leadServiceV2');
const { isValidObjectId, enforceLeadOwnershipOnRecord } = require('./client-crud');

// ============================================================================
// Interactions Management
// ============================================================================

/**
 * הוספת אינטראקציה
 */
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
      error: error.message
    });
  }
};

/**
 * קבלת אינטראקציות
 */
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
      error: error.message
    });
  }
};

/**
 * עדכון אינטראקציה
 */
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
      error: error.message
    });
  }
};

/**
 * מחיקת אינטראקציה
 */
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
      error: error.message
    });
  }
};

// ============================================================================
// Orders Management
// ============================================================================

/**
 * יצירת הזמנה
 */
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
      error: error.message
    });
  }
};

/**
 * קבלת הזמנות
 */
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
      error: error.message
    });
  }
};

/**
 * עדכון הזמנה
 */
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
      error: error.message
    });
  }
};

// ============================================================================
// Tasks Management
// ============================================================================

/**
 * יצירת משימה
 */
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
      error: error.message
    });
  }
};

/**
 * קבלת משימות
 */
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
      error: error.message
    });
  }
};

/**
 * עדכון משימה
 */
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
      error: error.message
    });
  }
};
