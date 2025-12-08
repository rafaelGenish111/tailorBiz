const axios = require('axios');

// Configure AI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * יצירת תוכן לקמפיין באמצעות AI
 */
async function generateCampaignContent(campaignType, targetAudience, goals) {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured');
      return {
        headline: 'כותרת מוצעת לקמפיין',
        body: 'תוכן מוצע לקמפיין - יש להגדיר OPENAI_API_KEY',
        cta: 'לחץ כאן',
        suggestions: []
      };
    }

    const prompt = `
אתה מומחה לשיווק דיגיטלי בישראל. צור תוכן שיווקי לקמפיין עם הפרטים הבאים:

סוג קמפיין: ${campaignType}
קהל יעד: ${targetAudience}
מטרות: ${goals}

צור תוכן בעברית הכולל:
1. כותרת משכנעת (עד 60 תווים)
2. תוכן גוף (עד 200 תווים)
3. קריאה לפעולה (CTA)
4. 3 הצעות נוספות לשיפור

החזר בפורמט JSON:
{
  "headline": "כותרת",
  "body": "תוכן",
  "cta": "קריאה לפעולה",
  "suggestions": ["הצעה 1", "הצעה 2", "הצעה 3"]
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה מומחה לשיווק דיגיטלי בישראל.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // נסה לפרסר JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON:', parseError);
    }

    // אם לא הצליח לפרסר, החזר טקסט גולמי
    return {
      headline: 'כותרת מוצעת',
      body: content.substring(0, 200),
      cta: 'לחץ כאן',
      suggestions: []
    };

  } catch (error) {
    console.error('Error generating campaign content:', error.message);
    return {
      headline: 'כותרת לקמפיין',
      body: 'תוכן לקמפיין',
      cta: 'לחץ כאן',
      suggestions: [],
      error: error.message
    };
  }
}

/**
 * אופטימיזציה של קמפיין קיים
 */
async function optimizeCampaign(campaignData, performanceData) {
  try {
    if (!OPENAI_API_KEY) {
      return {
        recommendations: [
          'הגדר OPENAI_API_KEY לקבלת המלצות מבוססות AI'
        ]
      };
    }

    const prompt = `
נתח את הקמפיין הבא ותן המלצות לשיפור:

שם קמפיין: ${campaignData.name}
סוג: ${campaignData.type}
תקציב: ₪${campaignData.budget.total}
הוצאה: ₪${campaignData.budget.spent}

ביצועים:
- ROI: ${performanceData.roi}%
- לידים: ${performanceData.leads}
- המרות: ${performanceData.conversions}
- Cost per Lead: ₪${performanceData.costPerLead}

תן 5 המלצות קונקרטיות לשיפור הקמפיין. החזר בפורמט JSON:
{
  "recommendations": ["המלצה 1", "המלצה 2", "המלצה 3", "המלצה 4", "המלצה 5"]
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה מומחה לאופטימיזציה של קמפיינים שיווקיים.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { recommendations: [content] };

  } catch (error) {
    console.error('Error optimizing campaign:', error.message);
    return {
      recommendations: ['שגיאה ביצירת המלצות'],
      error: error.message
    };
  }
}

/**
 * המלצות לקהל יעד
 */
async function suggestAudience(productType, historicalData) {
  try {
    if (!OPENAI_API_KEY) {
      return {
        segments: [
          { name: 'קהל כללי', description: 'הגדר OPENAI_API_KEY להמלצות מדויקות' }
        ]
      };
    }

    const prompt = `
המלץ על פילוחי קהל יעד למוצר/שירות מסוג: ${productType}

נתונים היסטוריים:
${JSON.stringify(historicalData, null, 2)}

תן 3-5 פילוחי קהל מומלצים. החזר בפורמט JSON:
{
  "segments": [
    {
      "name": "שם הפילוח",
      "description": "תיאור",
      "characteristics": ["מאפיין 1", "מאפיין 2"],
      "channels": ["ערוץ 1", "ערוץ 2"]
    }
  ]
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה מומחה לפילוח קהלים ושיווק ממוקד.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 600
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { segments: [] };

  } catch (error) {
    console.error('Error suggesting audience:', error.message);
    return {
      segments: [],
      error: error.message
    };
  }
}

/**
 * חיזוי ביצועים
 */
async function predictPerformance(campaignConfig) {
  try {
    if (!OPENAI_API_KEY) {
      return {
        predictedROI: 0,
        predictedLeads: 0,
        predictedConversions: 0,
        confidence: 'low',
        note: 'הגדר OPENAI_API_KEY לחיזויים מדויקים'
      };
    }

    const prompt = `
נתח ותחזה ביצועים לקמפיין הבא:

${JSON.stringify(campaignConfig, null, 2)}

תבסס על נתונים אלה, תן חיזוי לביצועים. החזר בפורמט JSON:
{
  "predictedROI": מספר,
  "predictedLeads": מספר,
  "predictedConversions": מספר,
  "confidence": "high/medium/low",
  "reasoning": "הסבר קצר"
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה מומחה לחיזוי ביצועים של קמפיינים שיווקיים.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      predictedROI: 0,
      predictedLeads: 0,
      predictedConversions: 0,
      confidence: 'low'
    };

  } catch (error) {
    console.error('Error predicting performance:', error.message);
    return {
      predictedROI: 0,
      predictedLeads: 0,
      predictedConversions: 0,
      confidence: 'low',
      error: error.message
    };
  }
}

/**
 * יצירת תובנות AI
 */
async function generateAIInsights(analyticsData) {
  try {
    if (!OPENAI_API_KEY) {
      console.log('OpenAI API key not configured - skipping AI insights');
      return [];
    }

    const prompt = `
נתח את נתוני השיווק הבאים וצור תובנות חשובות:

${JSON.stringify(analyticsData, null, 2)}

זהה:
1. הזדמנויות לשיפור
2. אזהרות על בעיות
3. המלצות לפעולה

החזר בפורמט JSON:
{
  "insights": [
    {
      "type": "opportunity/warning/recommendation",
      "priority": "high/medium/low",
      "category": "budget/performance/audience/timing/content/channel",
      "title": "כותרת קצרה",
      "description": "תיאור מפורט",
      "actionItems": ["פעולה 1", "פעולה 2"],
      "impactScore": מספר בין 0-100
    }
  ]
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה אנליסט שיווק מומחה המתמחה בזיהוי תובנות מנתונים.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.insights.map(insight => ({
        ...insight,
        aiGenerated: true
      }));
    }

    return [];

  } catch (error) {
    console.error('Error generating AI insights:', error.message);
    return [];
  }
}

/**
 * ניתוח מתחרים
 */
async function analyzeCompetitors(industry, competitors) {
  try {
    if (!OPENAI_API_KEY) {
      return {
        analysis: 'הגדר OPENAI_API_KEY לניתוח מתחרים',
        recommendations: []
      };
    }

    const prompt = `
נתח את המתחרים הבאים בתעשיית ${industry}:

${JSON.stringify(competitors, null, 2)}

תן:
1. ניתוח כללי של המתחרים
2. נקודות חוזק וחולשה שלהם
3. המלצות לדיפרנציאציה

החזר בפורמט JSON:
{
  "analysis": "ניתוח כללי",
  "strengths": ["חוזקה 1", "חוזקה 2"],
  "weaknesses": ["חולשה 1", "חולשה 2"],
  "recommendations": ["המלצה 1", "המלצה 2", "המלצה 3"]
}
`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'אתה אסטרטג שיווק המתמחה בניתוח מתחרים.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 700
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      analysis: content,
      recommendations: []
    };

  } catch (error) {
    console.error('Error analyzing competitors:', error.message);
    return {
      analysis: 'שגיאה בניתוח מתחרים',
      recommendations: [],
      error: error.message
    };
  }
}

// Keep backward compatibility with existing exports
exports.generateInsights = generateAIInsights;
exports.generateRecommendations = async (campaign) => {
  const performanceData = {
    roi: campaign.analytics?.roi || 0,
    leads: campaign.channels?.reduce((sum, ch) => sum + (ch.metrics?.clicked || 0), 0) || 0,
    conversions: campaign.channels?.reduce((sum, ch) => sum + (ch.metrics?.converted || 0), 0) || 0,
    costPerLead: campaign.analytics?.costPerLead || 0
  };
  const result = await optimizeCampaign(campaign, performanceData);
  return result.recommendations || [];
};
exports.analyzeCampaign = async (campaign) => {
  const performanceData = {
    roi: campaign.analytics?.roi || 0,
    leads: campaign.channels?.reduce((sum, ch) => sum + (ch.metrics?.clicked || 0), 0) || 0,
    conversions: campaign.channels?.reduce((sum, ch) => sum + (ch.metrics?.converted || 0), 0) || 0,
    costPerLead: campaign.analytics?.costPerLead || 0
  };
  const result = await optimizeCampaign(campaign, performanceData);
  return {
    score: campaign.analytics?.roi > 0 ? Math.min(100, campaign.analytics.roi) : 0,
    strengths: [],
    weaknesses: [],
    opportunities: result.recommendations || [],
    threats: []
  };
};

/**
 * יצירת תוכנית עבודה (משימות) מפרופיל לקוח
 * מחזיר תמיד מערך משימות או [] במקרה של כשל
 */
async function generateProjectPlan(clientData) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key missing - skipping AI plan generation');
      return [];
    }

    // הכנת המידע הרלוונטי בלבד ל-Prompt (חוסך טוקנים)
    const context = {
      business: clientData.businessInfo?.businessDescription || 'General Business',
      painPoints: clientData.assessmentForm?.painPoints?.timeWasters?.join(', ') || 'None specified',
      goals: clientData.assessmentForm?.goalsAndObjectives?.desiredOutcomes?.join(', ') || 'General improvement',
      modulesNeeded: clientData.assessmentForm?.processesToImprove || {},
      contractNotes: clientData.contract?.notes || ''
    };

    const prompt = `
    Role: Technical Project Manager.
    Task: Create a setup checklist for a new client in a CRM/Automation agency.
    
    Client Info:
    - Business: ${context.business}
    - Pain Points: ${context.painPoints}
    - Goals: ${context.goals}
    - Requested Modules: ${JSON.stringify(context.modulesNeeded)}
    - Contract Notes: ${context.contractNotes}

    Requirements:
    1. Generate 3-7 specific, actionable setup tasks.
    2. Include "Setup automation for [pain point]" if applicable.
    3. Include "Configure [module]" for requested modules.
    
    Output Format (JSON Array ONLY):
    [
      { "title": "Action Title", "description": "Brief details", "priority": "high/medium/low", "estimatedHours": 2 }
    ]
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: 'You are a JSON factory. Output only valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content || '';

    if (!content) {
      console.warn('AI Project Plan: empty content from OpenAI');
      return [];
    }

    // מנקה ```json ``` אם קיימים
    const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;

    // ניסיון ראשון: JSON ישיר
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // ניסיון שני: לחלץ מערך JSON מתוך טקסט ארוך
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          console.error('AI Project Plan JSON parse (array extract) failed:', innerErr.message);
        }
      } else {
        console.warn('AI Project Plan: no JSON array found in content');
      }
    }

    if (!Array.isArray(parsed)) {
      console.warn('AI Project Plan: parsed result is not an array, returning []');
      return [];
    }

    // וידוא מבנה בסיסי של כל משימה
    return parsed
      .filter(t => t && typeof t.title === 'string')
      .map(t => ({
        title: t.title,
        description: t.description || '',
        priority: t.priority || 'medium',
        estimatedHours: typeof t.estimatedHours === 'number' ? t.estimatedHours : 1
      }));

  } catch (error) {
    console.error('AI Project Plan Error:', error.message);
    return [];
  }
}

module.exports = {
  generateCampaignContent,
  optimizeCampaign,
  suggestAudience,
  predictPerformance,
  generateAIInsights,
  analyzeCompetitors,
  generateProjectPlan,
  // Backward compatibility
  generateInsights: generateAIInsights,
  generateRecommendations: exports.generateRecommendations,
  analyzeCampaign: exports.analyzeCampaign
};
