/**
 * תבניות הודעות מוכנות לשימוש
 * ניתן להתאים אישית ולהרחיב
 */

const templates = {
  // תבניות WhatsApp
  whatsapp: {
    welcomeNewLead: (clientName) => `
שלום ${clientName}! 👋

תודה שפנית אל BizFlow.

אני כאן כדי לעזור לך לייעל את העסק שלך, לחסוך זמן יקר, ולהחזיר לקוחות שאבדו.

מתי נוח לך לשיחת היכרות קצרה? (10-15 דקות)
    `.trim(),

    assessmentScheduled: (clientName, date, time) => `
היי ${clientName}! 📅

נהדר! קבעתי לנו פגישת אפיון ל-${date} בשעה ${time}.

בפגישה נדבר על:
- המצב הנוכחי בעסק
- נקודות כאב ואתגרים
- פתרונות אפשריים
- תוכנית פעולה

האם התאריך מתאים לך?
    `.trim(),

    followUpAfterAssessment: (clientName) => `
${clientName}, תודה על השיחה! 🙌

היה מעניין מאוד לשמוע על העסק שלך.

כמו שהבטחתי, אני מכין עבורך הצעה מפורטת שתכלול:
✓ פתרונות מותאמים אישית
✓ לוחות זמנים
✓ מחירים שקופים
✓ ROI משוער

אשלח אליך את ההצעה תוך 2-3 ימי עסקים.

יש לך שאלות בינתיים?
    `.trim(),

    proposalSent: (clientName) => `
שלום ${clientName}! 📧

שלחתי אליך את ההצעה המפורטת למייל.

ההצעה כוללת:
- ניתוח של הצרכים שזיהינו
- פתרון מותאם במיוחד עבורך
- לוח זמנים מפורט
- מחיר סופי ללא הפתעות

אשמח מאוד לשמוע מה דעתך ולענות על כל שאלה! 😊

מתי נוח לך לדבר על ההצעה?
    `.trim(),

    negotiationStage: (clientName) => `
${clientName}, אשמח לשמוע את המחשבות שלך על ההצעה.

יש משהו שתרצה לשנות או להתאים?
יש תקציב ספציפי שצריך להתחשב בו?

אני גמיש ואשמח למצוא את הפתרון המושלם עבורך! 💪
    `.trim(),

    dealWon: (clientName, startDate) => `
${clientName}! ברוך הבא למשפחת BizFlow! 🎉

אני מתרגש להתחיל את הפרויקט שלך!

תאריך התחלה: ${startDate}

הצעדים הקרובים:
1️⃣ חתימה על חוזה (שולח עכשיו למייל)
2️⃣ תשלום ראשון
3️⃣ פגישת kickoff

אני זמין לכל שאלה! בואו נעשה דברים גדולים ביחד! 🚀
    `.trim(),

    paymentReminder: (clientName, amount, dueDate) => `
שלום ${clientName}! 🔔

תזכורת ידידותית לתשלום:
- סכום: ₪${amount.toLocaleString()}
- תאריך יעד: ${dueDate}

אם כבר שילמת - תודה רבה! אשמח לאישור.
אם יש בעיה או שאלה - אני כאן לעזור!

פרטי העברה בנקאית:
בנק: [שם בנק]
סניף: [מספר סניף]
חשבון: [מספר חשבון]
    `.trim(),

    paymentOverdue: (clientName, amount, daysOverdue) => `
שלום ${clientName},

שמתי לב שהתשלום של ₪${amount.toLocaleString()} עבר את מועד התשלום ב-${daysOverdue} ימים.

יש איזושהי בעיה שאני יכול לעזור בה?

אשמח לתיאום בהקדם. 🙏
    `.trim(),

    projectUpdate: (clientName, milestone, progress) => `
עדכון פרויקט: ${clientName} 📊

השלמנו את "${milestone}"! ✨

התקדמות כללית: ${progress}%

הכל מתקדם כמתוכנן. אעדכן אותך שוב בקרוב!

יש שאלות? אני כאן!
    `.trim(),

    projectCompleted: (clientName) => `
${clientName}! 🎊

הפרויקט הושלם! 

כל המערכות פועלות ומוכנות לשימוש.

אני זמין לתמיכה ושאלות בכל עת.

אשמח לשמוע איך המערכת עוזרת לך!

תודה על האמון! 🙏
    `.trim(),

    feedbackRequest: (clientName) => `
היי ${clientName}!

אשמח מאוד לשמוע את החוויה שלך איתנו:

- מה עבד טוב?
- מה אפשר לשפר?
- האם תמליץ עלינו לעסקים אחרים?

המשובים שלך חשובים לי מאוד! 😊
    `.trim(),

    reEngagement: (clientName, daysSinceContact) => `
שלום ${clientName}!

מזמן לא דיברנו (${daysSinceContact} ימים)...

רציתי לבדוק איתך מה המצב?

האם עדיין רלוונטי לדבר על יעול ואוטומציה לעסק?

אם הזמן לא מתאים עכשיו - אשמח שתגיד ואחזור בעוד כמה חודשים.

מה דעתך?
    `.trim(),

    birthdayGreeting: (clientName) => `
🎂🎉 יום הולדת שמח ${clientName}! 🎉🎂

מאחל לך שנה מדהימה מלאה בהצלחות!

תודה שאתה חלק ממשפחת BizFlow!
    `.trim(),

    holidayGreeting: (clientName, holiday) => `
${clientName},

חג ${holiday} שמח! 🎊

מאחל לך ולמשפחה חג נפלא!

נדבר אחרי החג 😊
    `.trim()
  },

  // תבניות Email
  email: {
    welcomeEmail: {
      subject: (clientName) => `ברוך הבא ${clientName} - BizFlow`,
      body: (clientName) => `
        <div dir="rtl">
          <h2>שלום ${clientName},</h2>
          <p>תודה שפנית אל BizFlow!</p>
          <p>אנחנו מתמחים בבניית מערכות ניהול מותאמות אישית לעסקים קטנים ובינוניים.</p>
          <h3>איך אנחנו יכולים לעזור:</h3>
          <ul>
            <li>✅ חיסכון של 10+ שעות שבועיות</li>
            <li>✅ החזרת לקוחות שאבדו</li>
            <li>✅ אוטומציה של תהליכים ידניים</li>
            <li>✅ שיפור חווית הלקוח</li>
          </ul>
          <p>אשמח לקבוע שיחה קצרה להכיר ולהבין איך נוכל לעזור לעסק שלך.</p>
          <p>בברכה,<br>צוות BizFlow</p>
        </div>
      `
    },

    proposalEmail: {
      subject: (clientName) => `הצעת מחיר מותאמת אישית - ${clientName}`,
      body: (clientName, proposalLink) => `
        <div dir="rtl">
          <h2>שלום ${clientName},</h2>
          <p>כהבטחה, הכנתי עבורך הצעה מפורטת ומותאמת אישית.</p>
          <p>ההצעה כוללת:</p>
          <ul>
            <li>📋 ניתוח צרכים מלא</li>
            <li>🛠️ פתרון טכנולוגי מותאם</li>
            <li>📅 לוח זמנים מפורט</li>
            <li>💰 מחיר סופי וברור</li>
            <li>🎯 ROI משוער</li>
          </ul>
          <p><a href="${proposalLink}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:white;text-decoration:none;border-radius:5px;">צפה בהצעה המלאה</a></p>
          <p>אשמח לענות על כל שאלה!</p>
          <p>בברכה,<br>צוות BizFlow</p>
        </div>
      `
    },

    invoiceEmail: {
      subject: (invoiceNumber) => `חשבונית ${invoiceNumber} - BizFlow`,
      body: (clientName, invoiceNumber, amount, dueDate, pdfLink) => `
        <div dir="rtl">
          <h2>שלום ${clientName},</h2>
          <p>מצורפת חשבונית מספר <strong>${invoiceNumber}</strong></p>
          <table style="border-collapse:collapse;width:100%;max-width:400px;margin:20px 0;">
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>מספר חשבונית</strong></td>
              <td style="padding:10px;border:1px solid #ddd;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>סכום לתשלום</strong></td>
              <td style="padding:10px;border:1px solid #ddd;">₪${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #ddd;background:#f5f5f5;"><strong>תאריך לתשלום</strong></td>
              <td style="padding:10px;border:1px solid #ddd;">${dueDate}</td>
            </tr>
          </table>
          <p><a href="${pdfLink}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:white;text-decoration:none;border-radius:5px;">הורד חשבונית PDF</a></p>
          <h3>פרטי העברה בנקאית:</h3>
          <p>
            בנק: [שם בנק]<br>
            סניף: [מספר סניף]<br>
            חשבון: [מספר חשבון]
          </p>
          <p>תודה!</p>
          <p>בברכה,<br>צוות BizFlow</p>
        </div>
      `
    }
  },

  // תבניות SMS
  sms: {
    reminderShort: (clientName, action) => 
      `${clientName}, תזכורת: ${action}. BizFlow`,

    meetingReminder: (clientName, time) => 
      `${clientName}, תזכורת לפגישה מחר ב-${time}. BizFlow`,

    paymentReminder: (amount, dueDate) => 
      `תזכורת: תשלום ₪${amount} עד ${dueDate}. BizFlow`
  }
};

/**
 * פונקציה להחלפת משתנים בתבנית
 */
function fillTemplate(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * בחירת תבנית אוטומטית לפי סטטוס ואירוע
 */
function getTemplateForEvent(eventType, clientData) {
  const { status, personalInfo, assessmentForm } = clientData;
  
  const eventTemplates = {
    'client_created': templates.whatsapp.welcomeNewLead(personalInfo.fullName),
    'assessment_scheduled': templates.whatsapp.assessmentScheduled(
      personalInfo.fullName,
      'בקרוב',
      'בתיאום'
    ),
    'assessment_completed': templates.whatsapp.followUpAfterAssessment(personalInfo.fullName),
    'proposal_sent': templates.whatsapp.proposalSent(personalInfo.fullName),
    'payment_reminder': templates.whatsapp.paymentReminder(
      personalInfo.fullName,
      0,
      'בקרוב'
    ),
    'project_completed': templates.whatsapp.projectCompleted(personalInfo.fullName)
  };
  
  return eventTemplates[eventType] || null;
}

module.exports = {
  templates,
  fillTemplate,
  getTemplateForEvent
};







