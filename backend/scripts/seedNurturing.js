const mongoose = require('mongoose');
const LeadNurturing = require('../src/models/LeadNurturing');
require('dotenv').config({ path: './.env' }); // Load .env from backend folder

// הגדרת חיבור ל-MongoDB (עדכן את ה-URI לפי הצורך)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizflow-crm';

const templates = [
  // ========== תבנית 1: ליד חדש מ-WhatsApp/Facebook/Website ==========
  {
    name: 'ברוך הבא - ליד מפייסבוק/אתר/וואטסאפ',
    description: 'תגובה מיידית לליד חדש ליצירת רושם ראשוני',
    trigger: {
      type: 'new_lead',
      conditions: {
        leadSource: ['facebook', 'website', 'google_ads', 'whatsapp'],
        minLeadScore: 0 // מפעיל לכולם
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0, // מיידי
        actionType: 'send_whatsapp',
        content: {
          message: 'היי {name}, תודה שפנית ל-BizFlow. ראיתי שאתה מתעניין בפתרונות אוטומציה. מתי נוח לדבר?'
        },
        stopIfResponse: true
      },
      {
        step: 2,
        delayDays: 0, // מיד אחרי ההודעה
        actionType: 'change_status',
        content: {
          newStatus: 'contacted'
        },
        stopIfResponse: false
      },
      // שלב 3: הודעה שנייה אחרי 2 ימים אם לא ענו
      {
        step: 3,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 👋\n\nרציתי לחזור אליך לגבי הפנייה שלך.\nהאם עדיין יש עניין לשמוע על הפתרון שלנו?\nאשמח לתאם שיחת היכרות קצרה 😊`
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },

  // ========== תבנית 2: הרוח רפאים - ניסיון חידוש קשר ==========
  {
    name: 'הרוח רפאים - ניסיון חידוש קשר',
    description: 'להעיר לידים שנעלמו / לא ענו לשיחה הראשונה',
    trigger: {
      type: 'no_response',
      conditions: {
        daysWithoutContact: 2, // יומיים ללא קשר
        statuses: ['new_lead', 'contacted']
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: 'היי {name}, ניסיתי לתפוס אותך. האם הנושא עדיין רלוונטי עבור העסק שלך?'
        },
        stopIfResponse: true
      },
      {
        step: 2,
        delayDays: 2,
        actionType: 'create_task',
        content: {
          taskTitle: 'נסה להתקשר שוב ל-{name}',
          taskPriority: 'high'
        },
        stopIfResponse: true
      },
      {
        step: 3,
        delayDays: 4, // 4 ימים אחרי שלב 2
        actionType: 'update_lead_score',
        content: {
          scoreDelta: -10
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },

  // ========== תבנית 3: צייד לינקדאין ==========
  {
    name: 'צייד לינקדאין - פנייה אישית',
    description: 'פנייה עסקית ללידים שאותרו ידנית',
    trigger: {
      type: 'new_lead',
      conditions: {
        leadSource: ['linkedin']
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0, // מיידי
        actionType: 'create_task',
        content: {
          taskTitle: 'למד את פרופיל הלינקדאין של {name} וחפש נקודות חיבור',
          taskPriority: 'medium'
        },
        stopIfResponse: false
      },
      {
        step: 2,
        delayHours: 2, // שעתיים אחרי המשימה
        actionType: 'send_whatsapp',
        content: {
          message: 'היי {name}, נתקלתי בפרופיל שלך בלינקדאין וראיתי שאנחנו פועלים בתחומים משיקים. אשמח להכיר.'
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },

  // ========== תבנית 4: ליד קר (ללא תגובה 3+ ימים) ==========
  {
    name: '❄️ חימום ליד קר',
    description: 'רצף לליד שלא הגיב 3+ ימים',
    trigger: {
      type: 'no_response',
      conditions: {
        daysWithoutContact: 3,
        minLeadScore: 30
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 🌟\n\nשמתי לב שלא דיברנו כבר כמה ימים.\nרציתי לוודא שלא פספסתי משהו מצידך?\nאם עדיין יש עניין, אשמח לעדכן אותך על פתרונות חדשים שיכולים לעזור לך 💡`
        },
        stopIfResponse: true
      },
      {
        step: 2,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},\n\nראיתי שעסקים דומים ל-{business} חסכו בממוצע 15 שעות שבועיות עם המערכת שלנו.\nאשמח להראות לך איך בשיחה קצרה של 10 דקות.\nמתאים?`
        },
        stopIfResponse: true
      },
      {
        step: 3,
        delayDays: 3,
        actionType: 'create_task',
        content: {
          taskTitle: 'שיחת סגירה אחרונה',
          taskDescription: 'ליד לא מגיב - נסיון אחרון לפני סגירה',
          taskPriority: 'medium'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },

  // ========== תבנית 5: אחרי אפיון ==========
  {
    name: '📋 Follow-up אחרי אפיון',
    description: 'רצף אחרי השלמת שאלון אפיון',
    trigger: {
      type: 'status_change', // או טריגר מותאם אישית אם יש לך כזה בקוד
      conditions: {
        statuses: ['assessment_completed'] // וודא שהסטטוס הזה קיים במערכת שלך
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `תודה רבה {name}! 🙏\n\nקיבלתי את כל הפרטים שצריך.\nאני עובד על הצעה מותאמת אישית עבור {business} ואשלח אותה תוך 2-3 ימי עסקים.\nנשמע טוב?`
        },
        stopIfResponse: false
      },
      {
        step: 2,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: 'הכן הצעת מחיר מפורטת',
          taskDescription: 'על בסיס שאלון האפיון',
          taskPriority: 'high'
        },
        stopIfResponse: false
      },
      {
        step: 3,
        delayDays: 3,
        actionType: 'create_notification',
        content: {
          notificationTitle: '⏰ יש לשלוח הצעת מחיר',
          notificationMessage: 'עברו 3 ימים מאז האפיון'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },

  // ========== תבנית 6: אחרי שליחת הצעה ==========
  {
    name: '💼 Follow-up על הצעת מחיר',
    description: 'רצף אחרי שליחת הצעת מחיר',
    trigger: {
      type: 'status_change',
      conditions: {
        statuses: ['proposal_sent']
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 📨\n\nשלחתי לך את ההצעה המפורטת.\nתוכל לאשר שקיבלת?`
        },
        stopIfResponse: true
      },
      {
        step: 2,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name},\n\nהספקת לעבור על ההצעה?\nיש לך שאלות? אשמח לענות על הכל 😊`
        },
        stopIfResponse: true
      },
      {
        step: 3,
        delayDays: 3,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},\n\nרוב הלקוחות שלנו מקבלים החלטה תוך שבוע.\nאם אתה מהסס לגבי משהו, בוא נדבר - אולי אני יכול לעזור 💪`
        },
        stopIfResponse: true
      },
      {
        step: 4,
        delayDays: 2,
        actionType: 'create_task',
        content: {
          taskTitle: 'שיחת סגירה - הצעת מחיר',
          taskDescription: 'התקשר ללקוח לברר מה המצב',
          taskPriority: 'high'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },

  // ========== תבנית 7: ליד איכותי (VIP) ==========
  {
    name: '🔥 VIP Track - ליד חם',
    description: 'רצף מזורז ללידים עם Lead Score מעל 70',
    trigger: {
      type: 'new_lead',
      conditions: {
        minLeadScore: 70
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'create_notification',
        content: {
          notificationTitle: '🔥 ליד חם נכנס!',
          notificationMessage: 'ליד עם ציון גבוה - יש לטפל מיידית'
        },
        stopIfResponse: false
      },
      {
        step: 2,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: '🔥 VIP - יצירת קשר מיידית',
          taskDescription: 'ליד איכותי - התקשר בתוך שעה!',
          taskPriority: 'urgent'
        },
        stopIfResponse: false
      },
      {
        step: 3,
        delayHours: 3, // 3 שעות
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 👋\n\nתודה על הפנייה!\nראיתי שאתה מעוניין בפתרון מקצועי ל-{business}.\nאני זמין לשיחה עכשיו - מתאים?`
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },

  // ========== תבנית 8: שיחת סגירה נקבעה ==========
  {
    name: '📞 שיחת סגירה נקבעה',
    description: 'עדכון ציון ויצירת משימה לקראת שיחת סגירה',
    trigger: {
      type: 'interaction',
      conditions: {
        interactionTypes: ['call', 'meeting'],
        // directions: ['outbound'], // אופציונלי
        subjectContains: 'סגירה',
        statusIn: ['proposal_sent', 'negotiation']
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'update_lead_score',
        content: {
          scoreDelta: 10
        },
        stopIfResponse: false
      },
      {
        step: 2,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: 'היערכות לשיחת סגירה',
          taskDescription: 'עבור על האפיון, ההצעה וההתנגדויות לפני שיחת הסגירה',
          taskPriority: 'high'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },

  // ========== תבנית 9: סגירה מוצלחת ==========
  {
    name: '✅ סגירה מוצלחת ו-Onboarding',
    description: 'רצף לאחר סגירה מוצלחת הכולל הודעת תודה ובדיקת upsell',
    trigger: {
      type: 'status_change',
      conditions: {
        statuses: ['won', 'active_client'] // וודא תאימות לשמות הסטטוסים שלך
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'update_lead_score',
        content: {
          scoreDelta: 30
        },
        stopIfResponse: false
      },
      {
        step: 2,
        delayDays: 0,
        actionType: 'update_client_status',
        content: {
          newStatus: 'active_client'
        },
        stopIfResponse: false
      },
      {
        step: 3,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 🎉\n\nאיזה כיף שיצאנו לדרך ביחד!\nאם יש משהו שלא ברור או צריך עזרה, אני כאן לכל שאלה.`
        },
        stopIfResponse: true
      },
      {
        step: 4,
        delayDays: 30,
        actionType: 'create_task',
        content: {
          taskTitle: 'בדיקת שביעות רצון ו-Up-sell',
          taskDescription: 'בדיקת התקדמות, איסוף פידבק והצעת שדרוגים אפשריים',
          taskPriority: 'medium'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },

  // ========== תבנית 10: ליד קפוא (7 ימים ללא קשר) ==========
  {
    name: '❄️ ליד קפוא - 7 ימים ללא קשר',
    description: 'רצף החייאה לליד שלא היה איתו קשר מעל שבוע',
    trigger: {
      type: 'time_based',
      conditions: {
        daysSinceLastContact: 7,
        statuses: ['lead', 'contacted', 'proposal_sent']
      }
    },
    sequence: [
      {
        step: 1,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! ❄️\n\nשמתי לב שלא דיברנו כבר זמן מה.\nרק רציתי לבדוק אם עדיין רלוונטי להמשיך את התהליך או שנכון לעצור כאן.`
        },
        stopIfResponse: true
      },
      {
        step: 2,
        delayDays: 2,
        actionType: 'create_task',
        content: {
          taskTitle: 'שיחת רענון לליד קפוא',
          taskDescription: 'לבדוק אם הלקוח עדיין רלוונטי ולהבין מה עצר את התהליך',
          taskPriority: 'medium'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // מחיקת תבניות קיימות כדי למנוע כפילויות ולרענן את הנתונים
    await LeadNurturing.deleteMany({});
    console.log('🗑️ Cleared existing templates');

    await LeadNurturing.insertMany(templates);
    console.log(`🌱 Seeded ${templates.length} new templates successfully`);

    mongoose.connection.close();
    console.log('👋 Connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();