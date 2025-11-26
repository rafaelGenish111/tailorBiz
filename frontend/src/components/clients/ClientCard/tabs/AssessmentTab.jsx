import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormControlLabel,
  Slider,
  Chip
} from '@mui/material';
import { Save as SaveIcon, Download as DownloadIcon, AutoAwesome as AiIcon } from '@mui/icons-material';
import { useUpdateClient } from '../../../../admin/hooks/useClients';

const AssessmentTab = ({ client }) => {
  const [formData, setFormData] = useState(client?.assessmentForm || {});
  const [aiSummary, setAiSummary] = useState('');
  const updateClient = useUpdateClient();

  const handleSave = async () => {
    await updateClient.mutateAsync({
      id: client._id,
      data: {
        assessmentForm: {
          ...formData,
          filledAt: new Date()
        }
      }
    });
  };

  const handleExport = () => {
    const lines = [
      `דוח אפיון לקוח: ${client.personalInfo?.fullName || ''} - ${client.businessInfo?.businessName || ''}`,
      `תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}`,
      '-------------------------------------------',
      '',
      '1. היכרות בסיסית',
      `תיאור העסק: ${formData.basicInfo?.businessDescription || '-'}`,
      `מספר עובדים: ${formData.basicInfo?.numberOfEmployees || '-'}`,
      '',
      '2. מצב קיים',
      `שיטת ניהול נוכחית: ${formData.currentSystems?.managementMethod || '-'}`,
      `מערכת קיימת: ${formData.currentSystems?.existingSystem || '-'}`,
      `מה עובד טוב: ${formData.currentSystems?.whatWorksWell || '-'}`,
      `מה לא עובד: ${formData.currentSystems?.whatDoesntWork || '-'}`,
      '',
      '3. נקודות כאב',
      `בזבוזי זמן: ${formData.painPoints?.timeWasters?.join(', ') || '-'}`,
      `אובדן לקוחות: ${formData.painPoints?.customerLoss || '-'}`,
      `תהליכים לאוטומציה: ${formData.painPoints?.processesToAutomate?.join(', ') || '-'}`,
      '',
      '4. תהליכים לשיפור',
      ...processes
        .filter(p => formData.processesToImprove?.[p.key]?.needed)
        .map(p => `- ${p.label} (עדיפות: ${formData.processesToImprove?.[p.key]?.priority || 1}): ${formData.processesToImprove?.[p.key]?.notes || ''}`),
      `הכי דחוף: ${formData.processesToImprove?.mostUrgent || '-'}`,
      '',
      '5. מטרות ויעדים',
      `תוצאות רצויות: ${formData.goalsAndObjectives?.desiredOutcomes?.join(', ') || '-'}`,
      `קריטריוני הצלחה: ${formData.goalsAndObjectives?.successCriteria?.join(', ') || '-'}`,
      '',
      '6. דרישות מיוחדות',
      `אינטגרציות: ${formData.specialRequirements?.externalIntegrations?.join(', ') || '-'}`,
      `תהליכים ייחודיים: ${formData.specialRequirements?.uniqueProcesses?.join(', ') || '-'}`,
      '',
      '7. תקציב וזמנים',
      `תקציב: ${formData.budgetAndTimeline?.budgetRange || '-'}`,
      `תאריך יעד: ${formData.budgetAndTimeline?.desiredImplementationDate ? new Date(formData.budgetAndTimeline.desiredImplementationDate).toLocaleDateString('he-IL') : '-'}`,
      `דחיפות: ${formData.budgetAndTimeline?.urgencyLevel || '-'}`,
      '',
      '8. סיכום',
      `הערות נוספות: ${formData.nextSteps?.additionalNotes || '-'}`
    ];

    if (aiSummary) {
      lines.push('', '--- המלצת AI ---', aiSummary);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_${client.businessInfo?.businessName || 'client'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessChange = (processKey, field, value) => {
    setFormData({
      ...formData,
      processesToImprove: {
        ...formData.processesToImprove,
        [processKey]: {
          ...formData.processesToImprove?.[processKey],
          [field]: value
        }
      }
    });
  };

  const processes = [
    { key: 'queueManagement', label: 'ניהול תורים ויומן' },
    { key: 'customerTracking', label: 'מעקב לקוחות (CRM)' },
    { key: 'billingPayments', label: 'גביה, חשבוניות ותשלומים' },
    { key: 'inventory', label: 'ניהול מלאי ולוגיסטיקה' },
    { key: 'production', label: 'ניהול רצפת ייצור (Production)' },
    { key: 'fieldTeams', label: 'ניהול צוותי שטח ומתקינים' },
    { key: 'documents', label: 'ניהול מסמכים, שרטוטים ותוכניות' },
    { key: 'communication', label: 'תקשורת ורב-ערוציות (WhatsApp/SMS)' }
  ];

  const buildAiRecommendation = () => {
    const lines = [];

    // Pain points analysis
    const pain = formData.painPoints || {};
    if (pain.timeWasters?.length) {
      lines.push(
        `• זוהו מוקדי בזבוז זמן: ${pain.timeWasters.join(', ')}. מומלץ ליישם אוטומציה שתחליף פעולות ידניות אלו.`
      );
    }
    
    // Process specific recommendations
    const toImprove = formData.processesToImprove || {};
    
    if (toImprove.production?.needed) {
      lines.push(
        '• עבור ניהול הייצור: מומלץ להטמיע "מסך רצפת ייצור" (Tablet View) לעובדים, המציג שרטוטים וסטטוס הזמנה בזמן אמת.'
      );
    }

    if (toImprove.fieldTeams?.needed) {
      lines.push(
        '• עבור צוותי השטח: מומלץ לפתח אפליקציית מתקינים (Installer App) הכוללת ניווט, חיוג ללקוח וחתימה דיגיטלית על טופס התקנה.'
      );
    }

    if (toImprove.documents?.needed) {
      lines.push(
        '• נדרש ניהול מסמכים מתקדם: מערכת לקליטת שרטוטים ותוכניות (PDF/Images) ושיוך אוטומטי לכרטיס הלקוח/הזמנה.'
      );
    }

    if (toImprove.queueManagement?.needed) {
      lines.push('• מומלץ לשלב מודול יומן חכם וזימון תורים אוטומטי למניעת "חורים" בלו"ז.');
    }

    // Urgency & Implementation
    const enabledProcesses = processes
      .filter((p) => toImprove[p.key]?.needed)
      .sort(
        (a, b) =>
          (toImprove[b.key]?.priority || 0) - (toImprove[a.key]?.priority || 0)
      );
      
    if (enabledProcesses.length) {
      const top = enabledProcesses[0];
      lines.push(
        `• המיקוד הראשוני צריך להיות ב"${top.label}" (דחיפות ${toImprove[top.key]?.priority || 1}). זהו ה-Quick Win של הפרויקט.`
      );
    }

    // Budget check
    const bt = formData.budgetAndTimeline || {};
    if (bt.budgetRange === 'עד 10,000' && (toImprove.production?.needed || toImprove.fieldTeams?.needed)) {
       lines.push(
         '• שים לב: התקציב שהוגדר (עד 10,000 ₪) עשוי להיות נמוך עבור פיתוח אפליקציות שטח/ייצור. מומלץ לשקול פיתוח בשלבים או הגדלת תקציב.'
       );
    }

    if (!lines.length) {
      lines.push(
        'ה-AI זקוק למידע נוסף. אנא מלא את התהליכים לשיפור ונקודות הכאב כדי לקבל המלצה.'
      );
    }

    setAiSummary(
      [
        '🤖 דוח ניתוח מערכת (AI Generated):',
        '----------------------------------',
        ...lines,
        '',
        'סיכום ארכיטקטורה מומלצת:',
        'CRM מרכזי + ' + (toImprove.fieldTeams?.needed ? 'אפליקציית שטח + ' : '') + (toImprove.production?.needed ? 'מסך ייצור + ' : '') + 'אוטומציות WhatsApp.'
      ].join('\n')
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">שאלון אפיון מערכת</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            ייצוא דוח
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            שמור שינויים
          </Button>
        </Box>
      </Box>

      {formData.filledAt && (
        <Chip
          label={`עודכן לאחרונה ב-${new Date(formData.filledAt).toLocaleDateString('he-IL')}`}
          color="success"
          variant="outlined"
          sx={{ mb: 3 }}
        />
      )}

      {/* טופס מרוכז – כל השאלון בתוך כרטיס אחד */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* 1. היכרות בסיסית */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          1. היכרות בסיסית
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="תיאור העסק והשירות"
              value={formData.basicInfo?.businessDescription || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  basicInfo: {
                    ...formData.basicInfo,
                    businessDescription: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="לדוגמה: מפעל אלומיניום המייצר חלונות ודלתות, עובד מול קבלנים ופרטיים..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="מספר עובדים"
              type="number"
              value={formData.basicInfo?.numberOfEmployees || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  basicInfo: {
                    ...formData.basicInfo,
                    numberOfEmployees: parseInt(e.target.value) || 0
                  }
                })
              }
              fullWidth
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 2. הבנה של המצב הקיים */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          2. הבנה של המצב הקיים
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="איך מנהלים היום לקוחות, פניות ותורים?"
              value={formData.currentSystems?.managementMethod || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentSystems: {
                    ...formData.currentSystems,
                    managementMethod: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="מערכת קיימת? (אם כן, איזו?)"
              value={formData.currentSystems?.existingSystem || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentSystems: {
                    ...formData.currentSystems,
                    existingSystem: e.target.value
                  }
                })
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="מה עובד טוב בתהליך הנוכחי?"
              value={formData.currentSystems?.whatWorksWell || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentSystems: {
                    ...formData.currentSystems,
                    whatWorksWell: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="מה לא עובד / תוקע את העסק?"
              value={formData.currentSystems?.whatDoesntWork || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentSystems: {
                    ...formData.currentSystems,
                    whatDoesntWork: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 3. זיהוי נקודות כאב */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          3. זיהוי נקודות כאב
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="איפה נוצר בזבוז זמן עיקרי?"
              value={formData.painPoints?.timeWasters?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  painPoints: {
                    ...formData.painPoints,
                    timeWasters: e.target.value.split(',').map((s) => s.trim()).filter((s) => s)
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
              helperText="הפרד עם פסיקים (לדוגמה: מענה טלפוני, תיאום, חיפוש ניירת)"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="מצבים שבהם אובדים לקוחות"
              value={formData.painPoints?.customerLoss || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  painPoints: {
                    ...formData.painPoints,
                    customerLoss: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="תהליכים שהיית רוצה להפוך לאוטומטיים"
              value={formData.painPoints?.processesToAutomate?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  painPoints: {
                    ...formData.painPoints,
                    processesToAutomate: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
              helperText="הפרד עם פסיקים (לדוגמה: שליחת הצעת מחיר, תזכורת לפגישה, קליטת ליד)"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 4. תהליכים שצריך לשפר */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          4. מודולים ותהליכים נדרשים
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          סמן את המודולים הרלוונטיים עבור העסק ודרג את רמת הדחיפות שלהם.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {processes.map((process) => (
            <Paper key={process.key} variant="outlined" sx={{ p: 2, bgcolor: formData.processesToImprove?.[process.key]?.needed ? 'action.selected' : 'transparent' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.processesToImprove?.[process.key]?.needed || false}
                    onChange={(e) =>
                      handleProcessChange(process.key, 'needed', e.target.checked)
                    }
                  />
                }
                label={<Typography fontWeight={formData.processesToImprove?.[process.key]?.needed ? 'bold' : 'normal'}>{process.label}</Typography>}
              />
              {formData.processesToImprove?.[process.key]?.needed && (
                <Box sx={{ ml: 4, mt: 1 }}>
                  <Typography variant="caption" gutterBottom>
                    עדיפות (1 - נמוך, 5 - דחוף): {formData.processesToImprove?.[process.key]?.priority || 1}
                  </Typography>
                  <Slider
                    value={formData.processesToImprove?.[process.key]?.priority || 1}
                    onChange={(e, value) =>
                      handleProcessChange(process.key, 'priority', value)
                    }
                    min={1}
                    max={5}
                    marks
                    step={1}
                    sx={{ maxWidth: 300, display: 'block', mb: 2 }}
                  />
                  <TextField
                    label="הערות ספציפיות למודול זה"
                    value={formData.processesToImprove?.[process.key]?.notes || ''}
                    onChange={(e) =>
                      handleProcessChange(process.key, 'notes', e.target.value)
                    }
                    fullWidth
                    size="small"
                    variant="filled"
                  />
                </Box>
              )}
            </Paper>
          ))}
          <TextField
            label="מה הדבר הכי דחוף (ה-Pain Point הגדול ביותר)?"
            value={formData.processesToImprove?.mostUrgent || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                processesToImprove: {
                  ...formData.processesToImprove,
                  mostUrgent: e.target.value
                }
              })
            }
            fullWidth
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 5. מטרות ויעדים */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          5. מטרות ויעדים
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="מה היית רוצה שיקרה בעסק בעקבות המערכת?"
              value={formData.goalsAndObjectives?.desiredOutcomes?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goalsAndObjectives: {
                    ...formData.goalsAndObjectives,
                    desiredOutcomes: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
              helperText="הפרד עם פסיקים"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="איך נמדוד הצלחה? (Success Criteria)"
              value={formData.goalsAndObjectives?.successCriteria?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  goalsAndObjectives: {
                    ...formData.goalsAndObjectives,
                    successCriteria: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
              helperText="לדוגמה: חיסכון של 10 שעות שבועיות, גידול של 20% במכירות"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 6. דרישות מיוחדות */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          6. דרישות מיוחדות ואינטגרציות
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="אינטגרציות חיצוניות נדרשות"
              value={formData.specialRequirements?.externalIntegrations?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialRequirements: {
                    ...formData.specialRequirements,
                    externalIntegrations: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  }
                })
              }
              fullWidth
              helperText="לדוגמה: WhatsApp, חשבונית ירוקה, סליקת אשראי, יומן Google"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="תהליכים ייחודיים או מורכבים במיוחד"
              value={formData.specialRequirements?.uniqueProcesses?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialRequirements: {
                    ...formData.specialRequirements,
                    uniqueProcesses: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter((s) => s)
                  }
                })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 7. תקציב וזמנים */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          7. תקציב ולוחות זמנים
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>טווח תקציב מוערך</FormLabel>
              <RadioGroup
                row
                value={formData.budgetAndTimeline?.budgetRange || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetAndTimeline: {
                      ...formData.budgetAndTimeline,
                      budgetRange: e.target.value
                    }
                  })
                }
              >
                <FormControlLabel value="עד 10,000" control={<Radio />} label="עד 10k" />
                <FormControlLabel value="10,000-20,000" control={<Radio />} label="10k-20k" />
                <FormControlLabel value="20,000-40,000" control={<Radio />} label="20k-40k" />
                <FormControlLabel value="40,000-60,000" control={<Radio />} label="40k-60k" />
                <FormControlLabel value="60,000+" control={<Radio />} label="60k+" />
                <FormControlLabel value="לא בטוח" control={<Radio />} label="לא יודע" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="תאריך יעד רצוי להטמעה"
              type="date"
              value={formData.budgetAndTimeline?.desiredImplementationDate?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budgetAndTimeline: {
                    ...formData.budgetAndTimeline,
                    desiredImplementationDate: e.target.value
                  }
                })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 8. סיכום והמשך */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
          8. סיכום והמשך תהליך
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.nextSteps?.proposalPresentation || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextSteps: {
                        ...formData.nextSteps,
                        proposalPresentation: e.target.checked
                      }
                    })
                  }
                />
              }
              label="לקבוע פגישת הצגת פתרון ואפיון טכני"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="הערות נוספות לסיכום"
              value={formData.nextSteps?.additionalNotes || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nextSteps: {
                    ...formData.nextSteps,
                    additionalNotes: e.target.value
                  }
                })
              }
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* AI Recommendation */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f0f7ff', border: '1px solid #cce5ff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AiIcon color="primary" />
            <Typography variant="h6" color="primary">ניתוח אוטומטי (BizFlow AI)</Typography>
          </Box>
          <Button variant="contained" onClick={buildAiRecommendation} size="small">
            נתח נתונים והפק המלצות
          </Button>
        </Box>
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}
        >
          {aiSummary ||
            'מלא את השאלון ולחץ על "נתח נתונים" כדי לקבל אפיון ראשוני, המלצות לשיפור והערכת ארכיטקטורת מערכת.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AssessmentTab;
