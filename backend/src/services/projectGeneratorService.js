// backend/src/services/projectGeneratorService.js
const Project = require('../models/Project');
const TaskManager = require('../models/TaskManager');
const { generateProjectPlan } = require('./marketing/aiService');

exports.generateNewClientProject = async (client, userId) => {
  console.log(`🚀 Generating project for client: ${client.personalInfo.fullName}`);

  // 1. יצירת הפרויקט עצמו
  const newProject = await Project.create({
    name: `תיק לקוח: ${client.businessInfo.businessName}`,
    description: `פרויקט אוטומטי שנוצר בעקבות סגירת עסקה.`,
    clientId: client._id,
    ownerId: userId,
    status: 'active',
    color: '#00bcd4', // צבע המותג שלך
    startDate: new Date()
  });

  // 2. שליחה ל-AI לקבלת המשימות
  const suggestedTasks = await generateProjectPlan(client);

  if (!suggestedTasks || suggestedTasks.length === 0) {
    // Fallback: אם ה-AI נכשל, צור משימות דיפולטיביות
    suggestedTasks.push(
      { title: 'פגישת Kickoff', description: 'תיאום ציפיות והגדרת יעדים', priority: 'high' },
      { title: 'הקמת סביבת עבודה', description: 'יצירת יוזרים והגדרות בסיס', priority: 'high' }
    );
  }

  // 3. המרת המשימות למודל TaskManager ושמירה ב-DB
  const tasksToCreate = suggestedTasks.map(task => ({
    title: task.title,
    description: task.description,
    type: 'admin', // או סוג אחר
    priority: task.priority || 'medium',
    status: 'todo',
    projectId: newProject._id,
    relatedClient: client._id,
    assignedTo: userId, // משייך למנהל שסגר את העסקה
    createdBy: userId,
    estimatedMinutes: (task.estimatedHours || 1) * 60
  }));

  await TaskManager.insertMany(tasksToCreate);

  console.log(`✅ Created project "${newProject.name}" with ${tasksToCreate.length} tasks.`);
  return newProject;
};