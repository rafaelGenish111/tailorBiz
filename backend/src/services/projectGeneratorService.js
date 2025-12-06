const Project = require('../models/Project');
const TaskManager = require('../models/TaskManager');
const { generateProjectPlan } = require('./marketing/aiService');
const Notification = require('../models/Notification');

exports.generateNewClientProject = async (client, userId) => {
    try {
        console.log(`🚀 Starting auto-project generation for: ${client.personalInfo.fullName}`);

        // 1. יצירת הפרויקט
        const newProject = await Project.create({
            name: `תיק לקוח: ${client.businessInfo.businessName}`,
            description: `פרויקט שנוצר אוטומטית בעקבות סגירת עסקה.`,
            clientId: client._id,
            ownerId: userId,
            status: 'active',
            color: '#00bcd4',
            startDate: new Date()
        });

        // 2. קבלת משימות מה-AI
        let suggestedTasks = [];
        try {
            suggestedTasks = await generateProjectPlan(client);
        } catch (aiError) {
            console.error('⚠️ AI generation failed, using fallback:', aiError.message);
        }

        // Fallback: משימות ברירת מחדל
        if (!suggestedTasks || suggestedTasks.length === 0) {
            suggestedTasks = [
                { title: 'פגישת Kickoff', description: 'תיאום ציפיות והגדרת יעדים', priority: 'high', estimatedHours: 2 },
                { title: 'הקמת סביבה', description: 'פתיחת יוזרים והגדרות בסיס', priority: 'high', estimatedHours: 3 },
                { title: 'איסוף חומרים', description: 'לוגו, תכנים וגישות', priority: 'medium', estimatedHours: 1 }
            ];
        }

        // 3. שמירת המשימות ב-DB
        const tasksToCreate = suggestedTasks.map((task, index) => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (index + 1));

            return {
                title: task.title,
                description: task.description || '',
                type: 'admin',
                priority: task.priority || 'medium',
                status: 'todo',
                projectId: newProject._id,
                relatedClient: client._id,
                assignedTo: userId,
                createdBy: userId,
                dueDate: dueDate,
                estimatedMinutes: (task.estimatedHours || 1) * 60
            };
        });

        await TaskManager.insertMany(tasksToCreate);

        // 4. התראה למנהל
        if (userId) {
            await Notification.create({
                type: 'system',
                title: '✨ פרויקט חדש נוצר!',
                message: `הפרויקט ללקוח ${client.businessInfo.businessName} מוכן עם ${tasksToCreate.length} משימות.`,
                userId: userId,
                relatedClient: client._id,
                actionUrl: `/admin/projects`,
                priority: 'medium',
                icon: 'auto_awesome',
                color: '#9c27b0'
            });
        }

        return newProject;

    } catch (error) {
        console.error('❌ Error in generateNewClientProject:', error);
    }
};