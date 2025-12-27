/**
 * שירות התראות מרכזי
 * מטפל בשליחת התראות בכל הערוצים
 */

const whatsappService = require('./whatsappService');
const { templates } = require('../utils/messageTemplates');

class NotificationService {
  constructor() {
    this.notificationQueue = [];
    this.isProcessing = false;
  }

  /**
   * שליחת התראה על ליד חדש
   */
  async notifyNewLead(client, assignedUser) {
    console.log(`🆕 ליד חדש: ${client.personalInfo.fullName}`);
    
    // כאן אפשר להוסיף:
    // - שליחת אימייל למשתמש המוקצה
    // - התראה ל-Slack/Telegram
    // - Push notification
    
    const notification = {
      type: 'new_lead',
      title: 'ליד חדש!',
      message: `${client.personalInfo.fullName} - ${client.businessInfo.businessName}`,
      data: {
        clientId: client._id,
        leadSource: client.leadSource,
        leadScore: client.leadScore
      },
      recipients: [assignedUser]
    };

    await this.sendNotification(notification);
  }

  /**
   * שליחת התראה על משימה קרובה
   */
  async notifyUpcomingTask(task, client, assignedUser) {
    const notification = {
      type: 'task_reminder',
      title: 'תזכורת משימה',
      message: `${task.title} - ${client.personalInfo.fullName}`,
      data: {
        taskId: task._id,
        clientId: client._id,
        dueDate: task.dueDate,
        priority: task.priority
      },
      recipients: [assignedUser]
    };

    await this.sendNotification(notification);
  }

  /**
   * שליחת התראה על תשלום באיחור
   */
  async notifyOverduePayment(client, installment) {
    const notification = {
      type: 'payment_overdue',
      title: 'תשלום באיחור!',
      message: `${client.personalInfo.fullName} - ₪${installment.amount}`,
      data: {
        clientId: client._id,
        installmentId: installment._id,
        amount: installment.amount,
        dueDate: installment.dueDate
      },
      priority: 'high'
    };

    await this.sendNotification(notification);
  }

  /**
   * שליחת התראה על הזמנה חדשה
   */
  async notifyNewOrder(client, order) {
    const notification = {
      type: 'new_order',
      title: 'הזמנה חדשה! 🎉',
      message: `${client.personalInfo.fullName} - ₪${order.totalAmount}`,
      data: {
        clientId: client._id,
        orderId: order._id,
        amount: order.totalAmount
      },
      priority: 'high'
    };

    await this.sendNotification(notification);
  }

  /**
   * שליחת התראה כללית
   */
  async sendNotification(notification) {
    try {
      // כאן תוסיף את הלוגיקה לשליחה בפועל
      // לדוגמה:
      // - Email
      // - Push notification
      // - Slack webhook
      // - Telegram bot
      
      console.log('📢 התראה:', notification.title, '-', notification.message);
      
      // הוספה לתור התראות
      this.notificationQueue.push({
        ...notification,
        timestamp: new Date(),
        status: 'sent'
      });

      return { success: true };

    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * קבלת היסטוריית התראות
   */
  getNotificationHistory(limit = 50) {
    return this.notificationQueue
      .slice(-limit)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * ניקוי התראות ישנות
   */
  clearOldNotifications(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.notificationQueue = this.notificationQueue.filter(
      notif => new Date(notif.timestamp) > cutoffDate
    );

    console.log(`🧹 נוקו התראות ישנות מעל ${daysToKeep} ימים`);
  }
}

module.exports = new NotificationService();














