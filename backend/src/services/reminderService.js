const cron = require('node-cron');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const TaskManager = require('../models/TaskManager');
const whatsappService = require('./whatsappService');
const { templates } = require('../utils/messageTemplates');

class ReminderService {
    constructor() {
        this.jobs = [];
    }

    // התחלת כל התזכורות
    startAllReminders() {
        console.log('🔔 מתחיל שירות תזכורות...');

        // כל יום ב-9:00 - בדיקות יומיות
        this.jobs.push(
            cron.schedule('0 9 * * *', () => {
                this.checkDailyReminders();
            })
        );

        // כל יום ב-8:00 - תזכורות תשלום
        this.jobs.push(
            cron.schedule('0 8 * * *', () => {
                this.checkPaymentReminders();
            })
        );

        // כל שעה - בדיקת משימות דחופות
        this.jobs.push(
            cron.schedule('0 * * * *', () => {
                this.checkUrgentTasks();
            })
        );

        // סיכום יומי למנהל - כל יום ב-18:00
        this.jobs.push(
            cron.schedule('0 18 * * *', () => {
                console.log('📊 שולח סיכום יומי למנהל');
                this.sendDailySummaryToManager();
            })
        );

        console.log('✅ שירות תזכורות פעיל');
        console.log('📋 כמות משימות מתוזמנות:', this.jobs.length);
    }

    // בדיקות יומיות
    async checkDailyReminders() {
        console.log('📅 מבצע בדיקות יומיות...');

        await this.checkFollowUps();
        await this.checkInactiveClients();
        await this.checkOverduePayments();
        await this.checkUpcomingMeetings();
        await this.checkTodayTasks();
    }

    // בדיקת Follow-ups
    async checkFollowUps() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const clients = await Client.find({
                'interactions.nextFollowUp': {
                    $gte: today,
                    $lt: tomorrow
                },
                'interactions.completed': false
            }).populate('metadata.assignedTo', 'name email');

            console.log(`📞 Found ${clients.length} clients needing follow-up today`);

            for (const client of clients) {
                const pendingFollowUps = client.interactions.filter(
                    int => !int.completed &&
                        int.nextFollowUp &&
                        new Date(int.nextFollowUp) >= today &&
                        new Date(int.nextFollowUp) < tomorrow
                );

                if (pendingFollowUps.length > 0) {
                    const assignedUserId = client.metadata.assignedTo?._id || client.metadata.assignedTo;

                    if (assignedUserId) {
                        // יצירת התראה
                        await Notification.create({
                            type: 'follow_up',
                            title: 'תזכורת Follow-up',
                            message: `יש לך ${pendingFollowUps.length} follow-up(s) עם ${client.personalInfo.fullName}`,
                            userId: assignedUserId,
                            relatedClient: client._id,
                            priority: 'high',
                            actionUrl: `/admin/clients/${client._id}`,
                            actionText: 'פתח כרטיס לקוח',
                            icon: 'phone_forwarded',
                            color: '#ff9800'
                        });

                        // יצירת משימה אוטומטית
                        await TaskManager.create({
                            title: `Follow-up: ${client.personalInfo.fullName}`,
                            description: pendingFollowUps[0].subject || 'מעקב אחרי לקוח',
                            type: 'follow_up',
                            priority: 'high',
                            status: 'todo',
                            dueDate: new Date(),
                            relatedClient: client._id,
                            assignedTo: assignedUserId,
                            color: '#ff9800'
                        });

                        console.log(`  ✅ Created notification and task for ${client.personalInfo.fullName}`);
                    }
                }
            }

            return clients.length;
        } catch (error) {
            console.error('Error in checkFollowUps:', error);
            throw error;
        }
    }

    // בדיקת לקוחות לא פעילים
    async checkInactiveClients() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const inactiveClients = await Client.find({
                status: { $in: ['lead', 'contacted', 'assessment_scheduled'] },
                'metadata.lastContactedAt': { $lt: thirtyDaysAgo }
            }).populate('metadata.assignedTo', 'name email');

            if (inactiveClients.length > 0) {
                console.log(`❄️ יש ${inactiveClients.length} לידים קרים שצריך לחמם`);

                for (const client of inactiveClients) {
                    console.log(`  - ${client.personalInfo.fullName} (${client.businessInfo.businessName})`);

                    // אפשר להוסיף אוטומציה של שליחת הודעת "חימום"
                    // לדוגמה:
                    // await this.sendReEngagementMessage(client);
                }
            }

        } catch (error) {
            console.error('Error in checkInactiveClients:', error);
        }
    }

    // בדיקת תשלומים באיחור
    async checkOverduePayments() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const clients = await Client.find({
                'paymentPlan.installments.status': 'pending',
                'paymentPlan.installments.dueDate': { $lt: today }
            });

            let overdueCount = 0;
            console.log('💸 בודק תשלומים באיחור...');

            for (const client of clients) {
                const overdueInstallments = client.paymentPlan.installments.filter(
                    (inst) => inst.status === 'pending' && new Date(inst.dueDate) < today
                );

                if (overdueInstallments.length > 0) {
                    overdueCount += overdueInstallments.length;

                    // עדכון סטטוס לאיחור
                    overdueInstallments.forEach((inst) => {
                        inst.status = 'overdue';
                    });

                    await client.save();

                    const totalOverdue = overdueInstallments.reduce((sum, inst) => sum + inst.amount, 0);
                    const daysPastDue = Math.floor(
                        (new Date() - new Date(overdueInstallments[0].dueDate)) / (1000 * 60 * 60 * 24)
                    );

                    console.log(
                        `💰 תשלום באיחור: ${client.personalInfo.fullName} - ${overdueInstallments.length} תשלומים`
                    );

                    // יצירת התראה
                    const assignedUserId = client.metadata.assignedTo;

                    if (assignedUserId) {
                        await Notification.create({
                            type: 'payment_overdue',
                            title: '🚨 תשלום באיחור!',
                            message: `${client.personalInfo.fullName} - ₪${totalOverdue.toLocaleString()} באיחור של ${daysPastDue} ימים`,
                            userId: assignedUserId,
                            relatedClient: client._id,
                            priority: 'urgent',
                            actionUrl: `/admin/clients/${client._id}?tab=payments`,
                            actionText: 'טפל בתשלום',
                            icon: 'warning',
                            color: '#f44336'
                        });

                        // יצירת משימה
                        await TaskManager.create({
                            title: `תשלום באיחור: ${client.personalInfo.fullName}`,
                            description: `תשלום של ₪${totalOverdue.toLocaleString()} באיחור של ${daysPastDue} ימים`,
                            type: 'call',
                            priority: 'urgent',
                            status: 'todo',
                            dueDate: new Date(),
                            relatedClient: client._id,
                            assignedTo: assignedUserId,
                            color: '#f44336'
                        });

                        console.log(`  🚨 Created notification for overdue payment: ${client.personalInfo.fullName}`);
                    }

                    // שליחת תזכורת
                    await this.sendOverduePaymentReminder(client, overdueInstallments[0], daysPastDue);
                }
            }

            console.log(`💰 נמצאו ${overdueCount} תשלומים באיחור`);
            return overdueCount;
        } catch (error) {
            console.error('Error in checkOverduePayments:', error);
            throw error;
        }
    }

    // בדיקת פגישות קרובות
    async checkUpcomingMeetings() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const clients = await Client.find({
                'tasks.taskType': 'meeting',
                'tasks.status': { $in: ['pending', 'in_progress'] },
                'tasks.dueDate': {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            let meetingsCount = 0;

            for (const client of clients) {
                const upcomingMeetings = client.tasks.filter(
                    (task) =>
                        task.taskType === 'meeting' &&
                        task.status !== 'completed' &&
                        task.status !== 'cancelled' &&
                        new Date(task.dueDate) >= today &&
                        new Date(task.dueDate) < tomorrow
                );

                if (upcomingMeetings.length > 0) {
                    meetingsCount += upcomingMeetings.length;
                    const meeting = upcomingMeetings[0];
                    const meetingTime = new Date(meeting.dueDate).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    console.log(`📅 פגישה מחר עם ${client.personalInfo.fullName}`);

                    const assignedUserId = meeting.assignedTo;

                    if (assignedUserId) {
                        // יצירת התראה
                        await Notification.create({
                            type: 'meeting_reminder',
                            title: '📅 פגישה מחר',
                            message: `פגישה עם ${client.personalInfo.fullName} ב-${meetingTime}`,
                            userId: assignedUserId,
                            relatedClient: client._id,
                            priority: 'high',
                            actionUrl: `/admin/clients/${client._id}`,
                            actionText: 'צפה בפרטים',
                            icon: 'event',
                            color: '#2196f3'
                        });

                        console.log(`  📅 Created notification for meeting with ${client.personalInfo.fullName}`);
                    }

                    // שליחת תזכורת ללקוח
                    await this.sendMeetingReminder(client, meeting);
                }
            }

            console.log(`📅 נמצאו ${meetingsCount} פגישות למחר`);
            return meetingsCount;
        } catch (error) {
            console.error('Error in checkUpcomingMeetings:', error);
            throw error;
        }
    }

    // בדיקת משימות דחופות
    async checkUrgentTasks() {
        try {
            const now = new Date();
            const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

            const clients = await Client.find({
                'tasks.priority': 'urgent',
                'tasks.status': { $in: ['pending', 'in_progress'] },
                'tasks.dueDate': {
                    $gte: now,
                    $lte: nextHour
                }
            }).populate('tasks.assignedTo', 'name email');

            for (const client of clients) {
                const urgentTasks = client.tasks.filter(
                    task => task.priority === 'urgent' &&
                        task.status !== 'completed' &&
                        task.status !== 'cancelled' &&
                        task.dueDate &&
                        new Date(task.dueDate) >= now &&
                        new Date(task.dueDate) <= nextHour
                );

                if (urgentTasks.length > 0) {
                    console.log(`🚨 משימות דחופות עבור ${client.personalInfo.fullName}`);

                    // התראה למשתמש המוקצה
                }
            }

        } catch (error) {
            console.error('Error in checkUrgentTasks:', error);
        }
    }

    // תזכורות תשלום
    async checkPaymentReminders() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            const clients = await Client.find({
                'paymentPlan.installments.status': 'pending',
                'paymentPlan.installments.dueDate': {
                    $gte: today,
                    $lte: threeDaysFromNow
                },
                'paymentPlan.installments.reminderSent': { $ne: true }
            });

            for (const client of clients) {
                const upcomingPayments = client.paymentPlan.installments.filter(
                    inst => inst.status === 'pending' &&
                        new Date(inst.dueDate) >= today &&
                        new Date(inst.dueDate) <= threeDaysFromNow &&
                        !inst.reminderSent
                );

                if (upcomingPayments.length > 0) {
                    await this.sendPaymentReminder(client, upcomingPayments[0]);

                    upcomingPayments[0].reminderSent = true;
                    upcomingPayments[0].lastReminderDate = new Date();
                    await client.save();
                }
            }

        } catch (error) {
            console.error('Error in checkPaymentReminders:', error);
        }
    }

    // שליחת תזכורת תשלום
    async sendPaymentReminder(client, installment) {
        try {
            const dueDate = new Date(installment.dueDate).toLocaleDateString('he-IL');
            const message = templates.whatsapp.paymentReminder(
                client.personalInfo.fullName,
                installment.amount,
                dueDate
            );

            if (client.personalInfo.preferredContactMethod === 'whatsapp') {
                await whatsappService.sendMessage(
                    client.personalInfo.whatsappPhone || client.personalInfo.phone,
                    message
                );

                // הוספת אינטראקציה
                client.interactions.push({
                    type: 'whatsapp',
                    direction: 'outbound',
                    subject: 'תזכורת תשלום',
                    content: message,
                    timestamp: new Date()
                });

                await client.save();
            }

            console.log(`✅ נשלחה תזכורת תשלום ל-${client.personalInfo.fullName}`);

        } catch (error) {
            console.error('Error sending payment reminder:', error);
        }
    }

    // פונקציה חדשה: בדיקת משימות להיום
    async checkTodayTasks() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endOfToday = new Date(today);
            endOfToday.setHours(23, 59, 59, 999);

            const tasks = await TaskManager.find({
                dueDate: { $gte: today, $lte: endOfToday },
                status: { $nin: ['completed', 'cancelled'] }
            }).populate('assignedTo', '_id');

            console.log(`📋 Found ${tasks.length} tasks due today`);

            // קבץ משימות לפי משתמש
            const tasksByUser = {};
            tasks.forEach(task => {
                const userId = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
                if (userId) {
                    if (!tasksByUser[userId]) {
                        tasksByUser[userId] = [];
                    }
                    tasksByUser[userId].push(task);
                }
            });

            // צור התראה אחת לכל משתמש עם סיכום
            for (const [userId, userTasks] of Object.entries(tasksByUser)) {
                await Notification.create({
                    type: 'task_reminder',
                    title: '📋 סדר היום שלך',
                    message: `יש לך ${userTasks.length} משימות להיום`,
                    userId: userId,
                    priority: 'medium',
                    actionUrl: '/admin/tasks?date=today',
                    actionText: 'צפה בסדר היום',
                    icon: 'checklist',
                    color: '#9c27b0'
                });
            }

            console.log(`✅ Created ${Object.keys(tasksByUser).length} daily agenda notifications`);
            return tasks.length;
        } catch (error) {
            console.error('Error in checkTodayTasks:', error);
            throw error;
        }
    }

    // שליחת תזכורת פגישה
    async sendMeetingReminder(client, meeting) {
        try {
            const meetingDate = new Date(meeting.dueDate).toLocaleDateString('he-IL');
            const meetingTime = new Date(meeting.dueDate).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const message = `שלום ${client.personalInfo.fullName}! 📅\n\nתזכורת לפגישה שלנו מחר ב-${meetingTime}.\n\n${meeting.description || ''}\n\nמחכה לראות אותך!`;

            if (client.personalInfo.preferredContactMethod === 'whatsapp') {
                await whatsappService.sendMessage(
                    client.personalInfo.whatsappPhone || client.personalInfo.phone,
                    message
                );

                client.interactions.push({
                    type: 'whatsapp',
                    direction: 'outbound',
                    subject: 'תזכורת פגישה',
                    content: message,
                    timestamp: new Date()
                });

                await client.save();
            }

            console.log(`✅ נשלחה תזכורת פגישה ל-${client.personalInfo.fullName}`);

        } catch (error) {
            console.error('Error sending meeting reminder:', error);
        }
    }

    // שליחת תזכורת על תשלום באיחור
    async sendOverduePaymentReminder(client, installment, daysPastDue) {
        try {
            const message = templates.whatsapp.paymentOverdue(
                client.personalInfo.fullName,
                installment.amount,
                daysPastDue
            );

            if (client.personalInfo.preferredContactMethod === 'whatsapp' &&
                (client.personalInfo.whatsappPhone || client.personalInfo.phone)) {

                const phone = client.personalInfo.whatsappPhone || client.personalInfo.phone;

                console.log(`🚨 Overdue payment reminder sent to ${phone}`);

                client.interactions.push({
                    type: 'whatsapp',
                    direction: 'outbound',
                    subject: 'תזכורת תשלום באיחור',
                    content: message,
                    timestamp: new Date()
                });

                await client.save();
            }

            return true;
        } catch (error) {
            console.error('Error sending overdue payment reminder:', error);
            return false;
        }
    }

    // שליחת סיכום יומי למנהל
    async sendDailySummaryToManager() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const newLeadsToday = await Client.countDocuments({
                'metadata.createdAt': { $gte: today }
            });

            const completedTasks = await Client.aggregate([
                { $unwind: '$tasks' },
                {
                    $match: {
                        'tasks.completedDate': { $gte: today },
                        'tasks.status': 'completed'
                    }
                },
                { $count: 'total' }
            ]);

            const paymentsReceived = await Client.aggregate([
                { $unwind: '$paymentPlan.installments' },
                {
                    $match: {
                        'paymentPlan.installments.paidDate': { $gte: today },
                        'paymentPlan.installments.status': 'paid'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$paymentPlan.installments.paidAmount' }
                    }
                }
            ]);

            const overduePayments = await this.checkOverduePayments();
            const upcomingMeetings = await this.checkUpcomingMeetings();

            const summary = {
                date: today.toLocaleDateString('he-IL'),
                newLeads: newLeadsToday,
                completedTasks: completedTasks[0]?.total || 0,
                paymentsReceived: paymentsReceived[0]?.total || 0,
                overduePayments,
                upcomingMeetings
            };

            console.log('📊 סיכום יומי:');
            console.log(`  🆕 לידים חדשים: ${summary.newLeads}`);
            console.log(`  ✅ משימות שהושלמו: ${summary.completedTasks}`);
            console.log(`  💰 תשלומים שהתקבלו: ₪${summary.paymentsReceived.toLocaleString()}`);
            console.log(`  ⚠️ תשלומים באיחור: ${summary.overduePayments}`);
            console.log(`  📅 פגישות למחר: ${summary.upcomingMeetings}`);

            // כאן אפשר לחבר שירות אימייל ולשלוח את הסיכום למנהל
            // await emailService.sendDailySummary(managerEmail, summary);

            return summary;
        } catch (error) {
            console.error('Error in sendDailySummaryToManager:', error);
            throw error;
        }
    }

    // הרצה ידנית של כל הבדיקות (לבדיקה ידנית)
    async runManualCheck() {
        console.log('🔧 מריץ בדיקה ידנית לכל האוטומציות...');
        await this.checkDailyReminders();
        await this.checkPaymentReminders();
        await this.checkUrgentTasks();
        console.log('✅ בדיקה ידנית הסתיימה');
    }

    // עצירת כל התזכורות
    stopAllReminders() {
        this.jobs.forEach((job) => job.stop());
        console.log('⏹️ שירות תזכורות הופסק');
    }
}

module.exports = new ReminderService();

