// backend/seeds/nurturingTemplates.js
const LeadNurturing = require('../src/models/LeadNurturing');

const defaultTemplates = [
  // ========== תבנית 1: ליד חדש מ-WhatsApp ==========
  {
    name: '💬 ליד חדש מ-WhatsApp - רצף סטנדרטי',
    description: 'רצף אוטומטי לליד חדש שנכנס דרך WhatsApp',
    trigger: {
      type: 'new_lead',
      conditions: {
        leadSource: ['whatsapp'],
        minLeadScore: 15
      }
    },
    sequence: [
      // שלב 0: יצירת משימה מיידית
      {
        step: 0,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: 'צור קשר ראשוני עם ליד חדש',
          taskDescription: 'ליד חדש נכנס דרך WhatsApp - יש ליצור קשר בהקדם',
          taskPriority: 'high'
        },
        stopIfResponse: false
      },
      // שלב 1: תזכורת אחרי 24 שעות
      {
        step: 1,
        delayDays: 1,
        actionType: 'create_notification',
        content: {
          notificationTitle: '⏰ תזכורת - ליד ממתין',
          notificationMessage: 'עבר יום ללא מענה מהליד החדש'
        },
        stopIfResponse: true
      },
      // שלב 2: הודעת follow-up ראשונה אחרי 2 ימים
      {
        step: 2,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 👋

רציתי לחזור אליך לגבי הפנייה שלך.

האם עדיין יש עניין לשמוע על הפתרון שלנו?

אשמח לתאם שיחת היכרות קצרה 😊`
        },
        stopIfResponse: true
      },
      // שלב 3: הודעה שנייה אחרי 5 ימים
      {
        step: 3,
        delayDays: 3,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},

יכול להיות שזה לא הזמן הנכון, וזה בסדר גמור! 

אם תרצה בעתיד, אני פה.

בהצלחה! 🚀`
        },
        stopIfResponse: true
      },
      // שלב 4: סגירת ליד אחרי 7 ימים
      {
        step: 4,
        delayDays: 2,
        actionType: 'add_tag',
        content: {
          tagName: 'לא מגיב'
        },
        stopIfResponse: false
      }
    ],
    isActive: true
  },
  // ========== תבנית 2: ליד קר (ללא תגובה) ==========
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
      // שלב 0: הודעת re-engagement
      {
        step: 0,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 🌟

שמתי לב שלא דיברנו כבר כמה ימים.

רציתי לוודא שלא פספסתי משהו מצידך?

אם עדיין יש עניין, אשמח לעדכן אותך על פתרונות חדשים שיכולים לעזור לך 💡`
        },
        stopIfResponse: true
      },
      // שלב 1: הצעת ערך אחרי 2 ימים
      {
        step: 1,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},

ראיתי שעסקים דומים ל-{business} חסכו בממוצע 15 שעות שבועיות עם המערכת שלנו.

אשמח להראות לך איך בשיחה קצרה של 10 דקות.

מתאים?`
        },
        stopIfResponse: true
      },
      // שלב 2: משימה ידנית למנהל
      {
        step: 2,
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
  // ========== תבנית 3: אחרי אפיון ==========
  {
    name: '📋 Follow-up אחרי אפיון',
    description: 'רצף אחרי השלמת שאלון אפיון',
    trigger: {
      type: 'assessment_completed',
      conditions: {}
    },
    sequence: [
      // שלב 0: תודה והבטחה להצעה
      {
        step: 0,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `תודה רבה {name}! 🙏

קיבלתי את כל הפרטים שצריך.

אני עובד על הצעה מותאמת אישית עבור {business} ואשלח אותה תוך 2-3 ימי עסקים.

נשמע טוב?`
        },
        stopIfResponse: false
      },
      // שלב 1: משימה להכין הצעה
      {
        step: 1,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: 'הכן הצעת מחיר מפורטת',
          taskDescription: 'על בסיס שאלון האפיון',
          taskPriority: 'high'
        },
        stopIfResponse: false
      },
      // שלב 2: תזכורת אחרי 3 ימים
      {
        step: 2,
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
  // ========== תבנית 4: אחרי שליחת הצעה ==========
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
      // שלב 0: וידוא קבלה מיידי
      {
        step: 0,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 📨

שלחתי לך את ההצעה המפורטת.

תוכל לאשר שקיבלת?`
        },
        stopIfResponse: true
      },
      // שלב 1: בדיקת סטטוס אחרי יומיים
      {
        step: 1,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name},

הספקת לעבור על ההצעה?

יש לך שאלות? אשמח לענות על הכל 😊`
        },
        stopIfResponse: true
      },
      // שלב 2: דחיפה עדינה אחרי 5 ימים
      {
        step: 2,
        delayDays: 3,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},

רוב הלקוחות שלנו מקבלים החלטה תוך שבוע.

אם אתה מהסס לגבי משהו, בוא נדבר - אולי אני יכול לעזור 💪`
        },
        stopIfResponse: true
      },
      // שלב 3: שיחה אישית אחרי שבוע
      {
        step: 3,
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
  // ========== תבנית 5: ליד איכותי (Lead Score גבוה) ==========
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
      // שלב 0: התראה דחופה
      {
        step: 0,
        delayDays: 0,
        actionType: 'create_notification',
        content: {
          notificationTitle: '🔥 ליד חם נכנס!',
          notificationMessage: 'ליד עם ציון גבוה - יש לטפל מיידית'
        },
        stopIfResponse: false
      },
      // שלב 1: משימה דחופה
      {
        step: 1,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: '🔥 VIP - יצירת קשר מיידית',
          taskDescription: 'ליד איכותי - התקשר בתוך שעה!',
          taskPriority: 'urgent'
        },
        stopIfResponse: false
      },
      // שלב 2: הודעה מהירה אחרי 3 שעות
      {
        step: 2,
        delayDays: 0.125, // 3 שעות
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name}! 👋

תודה על הפנייה!

ראיתי שאתה מעוניין בפתרון מקצועי ל-{business}.

אני זמין לשיחה עכשיו - מתאים?`
        },
        stopIfResponse: true
      },
      // שלב 3: תזכורת אחרי 12 שעות
      {
        step: 3,
        delayDays: 0.5,
        actionType: 'create_notification',
        content: {
          notificationTitle: '⚠️ ליד VIP ממתין',
          notificationMessage: 'עבר חצי יום ללא מענה'
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },
  // ========== תבנית 6: לידים מ-Facebook/Google Ads ==========
  {
    name: '📱 טיפוח ליד ממדיה ממומנת',
    description: 'רצף ללידים שהגיעו מפרסום',
    trigger: {
      type: 'new_lead',
      conditions: {
        leadSource: ['facebook', 'google_ads', 'linkedin']
      }
    },
    sequence: [
      // שלב 0: הודעה ממותגת
      {
        step: 0,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 🌟

ראיתי שהתעניינת בפתרון שלנו.

אני כאן לענות על כל שאלה!

מה היה החלק שהכי עניין אותך?`
        },
        stopIfResponse: true
      },
      // שלב 1: שיתוף תוכן רלוונטי
      {
        step: 1,
        delayDays: 1,
        actionType: 'send_whatsapp',
        content: {
          message: `שלום {name},

הכנתי עבורך סרטון קצר (2 דקות) שמראה איך המערכת עובדת.

רוצה לראות?`
        },
        stopIfResponse: true
      },
      // שלב 2: הצעת פגישה
      {
        step: 2,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name},

מה דעתך על שיחת zoom קצרה של 15 דקות?

אראה לך בדיוק איך זה יכול לעזור ל-{business}.

מתי נוח לך? 📅`
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  },
  // ========== תבנית 7: שיחת סגירה נקבעה ==========
  {
    name: '📞 שיחת סגירה נקבעה',
    description: 'עדכון ציון ויצירת משימה לקראת שיחת סגירה',
    trigger: {
      type: 'interaction',
      conditions: {
        interactionTypes: ['call', 'meeting'],
        directions: ['outbound'],
        subjectContains: 'סגירה',
        statusIn: ['proposal_sent', 'negotiation']
      }
    },
    sequence: [
      // שלב 0: עדכון ציון
      {
        step: 0,
        delayDays: 0,
        actionType: 'update_lead_score',
        content: {
          scoreDelta: 10
        },
        stopIfResponse: false
      },
      // שלב 1: משימת היערכות לשיחת סגירה
      {
        step: 1,
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
  // ========== תבנית 8: סגירה מוצלחת ==========
  {
    name: '✅ סגירה מוצלחת ו-Onboarding',
    description: 'רצף לאחר סגירה מוצלחת הכולל הודעת תודה ובדיקת upsell',
    trigger: {
      type: 'status_change',
      conditions: {
        statusIn: ['won']
      }
    },
    sequence: [
      // שלב 0: עדכון ציון
      {
        step: 0,
        delayDays: 0,
        actionType: 'update_lead_score',
        content: {
          scoreDelta: 30
        },
        stopIfResponse: false
      },
      // שלב 1: עדכון הסטטוס ללקוח פעיל
      {
        step: 1,
        delayDays: 0,
        actionType: 'update_client_status',
        content: {
          newStatus: 'active_client'
        },
        stopIfResponse: false
      },
      // שלב 2: הודעת תודה ושביעות רצון אחרי יומיים
      {
        step: 2,
        delayDays: 2,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 🎉

איזה כיף שיצאנו לדרך ביחד!

אם יש משהו שלא ברור או צריך עזרה, אני כאן לכל שאלה.`
        },
        stopIfResponse: true
      },
      // שלב 3: בדיקת שביעות רצון ו-upsell אחרי חודש
      {
        step: 3,
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
  // ========== תבנית 9: ליד קפוא (7 ימים ללא קשר) ==========
  {
    name: '❄️ ליד קפוא - 7 ימים ללא קשר',
    description: 'רצף החייאה לליד שלא היה איתו קשר מעל שבוע',
    trigger: {
      type: 'time_based',
      conditions: {
        daysSinceLastContact: 7,
        statusIn: ['lead', 'contacted', 'proposal_sent']
      }
    },
    sequence: [
      // שלב 0: הודעת \"רק בודק\" לליד קר
      {
        step: 0,
        delayDays: 0,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! ❄️

שמתי לב שלא דיברנו כבר זמן מה.

רק רציתי לבדוק אם עדיין רלוונטי להמשיך את התהליך או שנכון לעצור כאן.`
        },
        stopIfResponse: true
      },
      // שלב 1: משימת שיחת רענון אם אין תגובה
      {
        step: 1,
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
  },
  // ========== תבנית 10: בדיקת לקוח פעיל (30 ימים ללא קשר) ==========
  {
    name: '🔁 בדיקת לקוח פעיל - 30 ימים ללא קשר',
    description: 'רצף לבדיקה יזומה של לקוח פעיל לאחר תקופה ללא קשר',
    trigger: {
      type: 'time_based',
      conditions: {
        daysSinceLastContact: 30,
        statusIn: ['active_client']
      }
    },
    sequence: [
      // שלב 0: משימת check-in
      {
        step: 0,
        delayDays: 0,
        actionType: 'create_task',
        content: {
          taskTitle: 'שיחת Check-in עם לקוח פעיל',
          taskDescription: 'לשאול איך הולך, לזהות נקודות לשיפור ולבחון אפשרויות הרחבה',
          taskPriority: 'medium'
        },
        stopIfResponse: false
      },
      // שלב 1: הודעת follow-up אוטומטית אם לא היה קשר
      {
        step: 1,
        delayDays: 3,
        actionType: 'send_whatsapp',
        content: {
          message: `היי {name}! 🙂

רק רציתי לוודא שכל מה שבנינו ב-{business} עובד כמו שצריך.

אם יש משהו שתרצה לשפר או להוסיף, אשמח לחשוב יחד.`
        },
        stopIfResponse: true
      }
    ],
    isActive: true
  }
];

// פונקציה להטמעת התבניות
async function seedTemplates() {
  try {
    console.log('🌱 Seeding nurturing templates...');

    for (const template of defaultTemplates) {
      const existing = await LeadNurturing.findOne({ name: template.name });
      
      if (!existing) {
        await LeadNurturing.create(template);
        console.log(`  ✅ Created: ${template.name}`);
      } else {
        console.log(`  ⏭️  Already exists: ${template.name}`);
      }
    }

    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  }
}

module.exports = { seedTemplates, defaultTemplates };


