// backend/src/config/leadScoring.js
// מפה מרכזית לניקוד פעולות/אינטראקציות של לידים

// ניקוד לפי אירועים לוגיים (לא בהכרח type ישיר של interaction)
const INTERACTION_SCORE_RULES = {
  // קביעת שיחת סגירה / פגישה
  closing_call_scheduled: 10,

  // שיחת סגירה בוצעה, עדיין לא נסגר
  closing_call_done: 20,

  // סגירה מוצלחת (למשל כאשר הסטטוס הופך ל-won)
  deal_won: 30,

  // הפסד / סגירה ללא הצלחה
  deal_lost: -20,

  // ליד שלא הגיב לאורך זמן
  long_no_response: -10
};

module.exports = {
  INTERACTION_SCORE_RULES
};