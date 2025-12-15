/**
 * חישוב Lead Score אוטומטי
 * ציון בין 0-100 המבוסס על מספר פרמטרים
 */
function calculateLeadScore(client) {
  let score = 0;
  
  // 1. מקור הליד (0-25 נקודות)
  const sourceScores = {
    'referral': 25,        // המלצה - הכי איכותי
    'website_form': 20,    // פנייה ישירה
    'linkedin': 18,        // עסקי ומקצועי
    'whatsapp': 15,        // פעיל ומעורב
    'facebook': 12,        // רשתות חברתיות
    'google_ads': 12,      // חיפוש אקטיבי
    'social_media': 10,    // כללי
    'cold_call': 5,        // פנייה יוזמת שלנו
    'other': 5
  };
  score += sourceScores[client.leadSource] || 0;
  
  // 2. רמת תקציב (0-25 נקודות)
  if (client.assessmentForm?.budgetAndTimeline?.budgetRange) {
    const budgetScores = {
      '60,000+': 25,
      '40,000-60,000': 20,
      '20,000-40,000': 15,
      '10,000-20,000': 10,
      'עד 10,000': 5,
      'לא בטוח': 3
    };
    score += budgetScores[client.assessmentForm.budgetAndTimeline.budgetRange] || 0;
  }
  
  // 3. דחיפות (0-20 נקודות)
  if (client.assessmentForm?.budgetAndTimeline?.urgencyLevel) {
    const urgencyScores = {
      'urgent': 20,
      'high': 15,
      'medium': 10,
      'low': 5
    };
    score += urgencyScores[client.assessmentForm.budgetAndTimeline.urgencyLevel] || 0;
  }
  
  // 4. מספר תהליכים לשיפור (0-20 נקודות)
  if (client.assessmentForm?.processesToImprove) {
    const processes = client.assessmentForm.processesToImprove;
    const neededProcesses = Object.values(processes)
      .filter(p => typeof p === 'object' && p.needed === true);
    
    // כל תהליך נוסף = 4 נקודות, מקסימום 20
    score += Math.min(neededProcesses.length * 4, 20);
  }
  
  // 5. שאלון אפיון מולא (10 נקודות)
  if (client.assessmentForm?.filledAt) {
    score += 10;
  }
  
  // 6. רמת מעורבות - אינטראקציות (0-15 נקודות)
  if (client.interactions && client.interactions.length > 0) {
    // כל אינטראקציה = 2 נקודות, מקסימום 15
    score += Math.min(client.interactions.length * 2, 15);
  }
  
  // 7. יש אימייל (5 נקודות)
  if (client.personalInfo?.email) {
    score += 5;
  }
  
  // 8. יש אתר לעסק (3 נקודות)
  if (client.businessInfo?.website) {
    score += 3;
  }
  
  // 9. גודל העסק (0-7 נקודות)
  if (client.businessInfo?.numberOfEmployees) {
    const employees = client.businessInfo.numberOfEmployees;
    if (employees >= 20) score += 7;
    else if (employees >= 10) score += 5;
    else if (employees >= 5) score += 3;
    else if (employees >= 2) score += 1;
  }
  
  // הפחתת ניקוד אם הליד ישן מדי ולא התקדם
  const daysSinceCreation = Math.floor(
    (new Date() - new Date(client.metadata.createdAt)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceCreation > 30 && client.status === 'lead') {
    score *= 0.7; // הפחתה של 30%
  } else if (daysSinceCreation > 60 && client.status === 'contacted') {
    score *= 0.5; // הפחתה של 50%
  }
  
  // וודא שהציון בין 0-100
  return Math.min(Math.round(score), 100);
}

/**
 * קבלת קטגוריה לפי ציון
 */
function getLeadCategory(score) {
  if (score >= 80) return { category: 'hot', label: 'חם מאוד', color: 'red' };
  if (score >= 60) return { category: 'warm', label: 'חם', color: 'orange' };
  if (score >= 40) return { category: 'lukewarm', label: 'פושר', color: 'yellow' };
  if (score >= 20) return { category: 'cool', label: 'קריר', color: 'blue' };
  return { category: 'cold', label: 'קר', color: 'gray' };
}

/**
 * המלצה לפעולה הבאה לפי ציון
 */
function getRecommendedAction(client) {
  const score = calculateLeadScore(client);
  const category = getLeadCategory(score);
  
  const recommendations = {
    hot: {
      action: 'קבע פגישה דחופה',
      priority: 'urgent',
      reasoning: 'ליד איכותי מאוד - פוטנציאל גבוה להמרה'
    },
    warm: {
      action: 'שלח הצעת מחיר',
      priority: 'high',
      reasoning: 'ליד איכותי - מוכן להמשך תהליך'
    },
    lukewarm: {
      action: 'קבע שיחת הבהרה',
      priority: 'medium',
      reasoning: 'צריך מידע נוסף כדי להעריך נכון'
    },
    cool: {
      action: 'שלח מידע כללי',
      priority: 'low',
      reasoning: 'ליד בשלב מוקדם - צריך חימום'
    },
    cold: {
      action: 'הוסף לרשימת תזכורות',
      priority: 'low',
      reasoning: 'ליד עם פוטנציאל נמוך כרגע'
    }
  };
  
  return {
    score,
    category: category.category,
    label: category.label,
    color: category.color,
    ...recommendations[category.category]
  };
}

module.exports = {
  calculateLeadScore,
  getLeadCategory,
  getRecommendedAction
};










