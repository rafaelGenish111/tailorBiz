const Project = require('../models/Project');
const TaskManager = require('../models/TaskManager');
const { generateProjectPlan } = require('./marketing/aiService');
const Notification = require('../models/Notification');

const mongoose = require('mongoose');

// Helper function to check if string is valid ObjectId
const isValidObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id) && id !== 'temp-user-id';
};

exports.generateNewClientProject = async (client, userId) => {
    try {
        console.log(`🚀 generateNewClientProject called with clientId: ${client._id}, userId: ${userId}`);

        if (!client || !client._id) {
            throw new Error('Client or client._id is missing');
        }

        // בדיקה אם ה-userId תקין
        const validUserId = isValidObjectId(userId) ? userId : null;

        if (!validUserId) {
            console.warn('⚠️ userId is missing or invalid, project will be created without owner');
        }

        const clientName = client.personalInfo?.fullName || 'לקוח חדש';
        const businessName = client.businessInfo?.businessName || 'עסק חדש';

        console.log(`🚀 Starting auto-project generation for: ${clientName} (${businessName})`);

        // 1. יצירת הפרויקט
        const newProject = await Project.create({
            name: `תיק לקוח: ${businessName}`,
            description: `פרויקט שנוצר אוטומטית בעקבות סגירת עסקה.`,
            clientId: client._id,
            ownerId: validUserId,
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
                assignedTo: validUserId,
                createdBy: validUserId,
                dueDate: dueDate,
                estimatedMinutes: (task.estimatedHours || 1) * 60
            };
        });

        await TaskManager.insertMany(tasksToCreate);
        console.log(`✅ Created ${tasksToCreate.length} tasks for project ${newProject._id}`);

        // 4. התראה למנהל
        if (validUserId) {
            try {
                await Notification.create({
                    type: 'system',
                    title: '✨ פרויקט חדש נוצר!',
                    message: `הפרויקט ללקוח ${businessName} מוכן עם ${tasksToCreate.length} משימות.`,
                    userId: validUserId,
                    relatedClient: client._id,
                    actionUrl: `/admin/projects`,
                    priority: 'medium',
                    icon: 'auto_awesome',
                    color: '#9c27b0'
                });
                console.log(`✅ Notification created for userId: ${validUserId}`);
            } catch (notifError) {
                console.error('⚠️ Failed to create notification:', notifError.message);
            }
        } else {
            console.warn('⚠️ Skipping notification - validUserId is missing');
        }

        console.log(`✅ Project generation completed successfully. Project ID: ${newProject._id}`);
        return newProject;

    } catch (error) {
        console.error('❌ Error in generateNewClientProject:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            clientId: client?._id,
            userId: userId
        });
        throw error; // זרוק את השגיאה כדי שנוכל לראות אותה בקונטרולר
    }
};