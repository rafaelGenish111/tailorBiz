// frontend/src/components/clients/ClientCard/tabs/AssessmentTab.jsx

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
import { Save as SaveIcon } from '@mui/icons-material';
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
    { key: 'queueManagement', label: 'ניהול תורים' },
    { key: 'customerTracking', label: 'מעקב לקוחות' },
    { key: 'billingPayments', label: 'גביה ותשלומים' },
    { key: 'inventory', label: 'מלאי' },
    { key: 'communication', label: 'תקשורת מול לקוחות' }
  ];

  const buildAiRecommendation = () => {
    const lines = [];

    // Pain points
    const pain = formData.painPoints || {};
    if (pain.timeWasters?.length) {
      lines.push(
        `• בזבוזי זמן מרכזיים: ${pain.timeWasters.join(', ')}. מומלץ לאפיין אוטומציות ותבניות פעולה קבועות סביב נקודות אלו.`
      );
    }
    if (pain.customerLoss) {
      lines.push(
        `• אובדן לקוחות: ${pain.customerLoss}. כדאי להגדיר סטטוסי ליד ברורים ותהליכי Follow-up אוטומטיים.`
      );
    }

    // Processes to improve
    const toImprove = formData.processesToImprove || {};
    const enabledProcesses = processes
      .filter((p) => toImprove[p.key]?.needed)
      .sort(
        (a, b) =>
          (toImprove[b.key]?.priority || 0) - (toImprove[a.key]?.priority || 0)
      );
    if (enabledProcesses.length) {
      const top = enabledProcesses[0];
      lines.push(
        `• התהליך הדחוף ביותר לשיפור הוא \"${top.label}\" (עדיפות ${
          toImprove[top.key]?.priority || 1
        }). מומלץ להתחיל בו את האפיון והפיתוח.`
      );
    }

    // Goals
    const goals = formData.goalsAndObjectives || {};
    if (goals.desiredOutcomes?.length) {
      lines.push(
        `• יעדים מרכזיים מהמערכת: ${goals.desiredOutcomes.join(', ')}. נתרגם אותם למדדי הצלחה ותצוגות ניהוליות (דשבורדים).`
      );
    }
    if (goals.successCriteria?.length) {
      lines.push(
        `• קריטריוני הצלחה: ${goals.successCriteria.join(
          ', '
        )}. נגדיר מדדים ברורים ונעקוב אחריהם לאחר ההטמעה.`
      );
    }

    // Budget & timeline
    const bt = formData.budgetAndTimeline || {};
    if (bt.budgetRange) {
      lines.push(
        `• טווח תקציב מוערך: ${bt.budgetRange}. נבנה פתרון הדרגתי שמתאים למסגרת הזו.`
      );
    }
    if (bt.desiredImplementationDate) {
      lines.push(
        `• יעד זמנים: הטמעה עד ${new Date(
          bt.desiredImplementationDate
        ).toLocaleDateString('he-IL')}. נבנה גאנט פיתוח בהתאם.`
      );
    }

    // Next steps
    const nextSteps = formData.nextSteps || {};
    if (nextSteps.proposalPresentation) {
      lines.push(
        '• מומלץ להכין דמו קצר + מצגת תועלות ממוקדת לפגישת הצגת הפתרון.'
      );
    }

    if (!lines.length) {
      lines.push(
        'כדי לקבל המלצה אוטומטית, מלא לפחות חלק מנקודות הכאב, התהליכים לשיפור והמטרות העסקיות.'
      );
    }

    setAiSummary(
      [
        'תוכנית מומלצת לאפיון המערכת (AI):',
        '',
        ...lines,
        '',
        'תצוגה מקדימה של התוצר: דשבורד ניהול לקוחות, תצוגת ציר תהליכים (Pipeline), תזכורות אוטומטיות ותיעוד מלא של אינטראקציות.'
      ].join('\n')
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">שאלון אפיון טלפוני</Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          שמור
        </Button>
      </Box>

      {formData.filledAt && (
        <Chip
          label={`מולא ב-${new Date(formData.filledAt).toLocaleDateString('he-IL')}`}
          color="success"
          sx={{ mb: 3 }}
        />
      )}

      {/* טופס מרוכז – כל השאלון בתוך כרטיס אחד */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* 1. היכרות בסיסית */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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
              rows={3}
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
              label="מה עובד טוב?"
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
              label="מה לא עובד?"
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
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          3. זיהוי נקודות כאב
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="איפה נוצר בזבוז זמן בעסק?"
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
              helperText="הפרד עם פסיקים"
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
              label="תהליכים לאוטומציה"
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
              helperText="הפרד עם פסיקים"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 4. תהליכים שצריך לשפר */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          4. תהליכים שצריך לשפר
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {processes.map((process) => (
            <Box key={process.key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.processesToImprove?.[process.key]?.needed || false}
                    onChange={(e) =>
                      handleProcessChange(process.key, 'needed', e.target.checked)
                    }
                  />
                }
                label={process.label}
              />
              {formData.processesToImprove?.[process.key]?.needed && (
                <Box sx={{ ml: 4, mt: 1 }}>
                  <Typography gutterBottom>
                    עדיפות: {formData.processesToImprove?.[process.key]?.priority || 1}
                  </Typography>
                  <Slider
                    value={formData.processesToImprove?.[process.key]?.priority || 1}
                    onChange={(e, value) =>
                      handleProcessChange(process.key, 'priority', value)
                    }
                    min={1}
                    max={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <TextField
                    label="הערות"
                    value={formData.processesToImprove?.[process.key]?.notes || ''}
                    onChange={(e) =>
                      handleProcessChange(process.key, 'notes', e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                  />
                </Box>
              )}
            </Box>
          ))}
          <TextField
            label="מה הכי דחוף לפתור?"
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
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 5. מטרות ויעדים */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          5. מטרות ויעדים
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="מה היית רוצה שיקרה?"
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
              label="קריטריוני הצלחה"
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
              helperText="הפרד עם פסיקים"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 6. דרישות מיוחדות */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          6. דרישות מיוחדות
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
              helperText="לדוגמה: WhatsApp, חשבוניות, תשלום..."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="תהליכים ייחודיים לעסק"
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
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          7. תקציב וזמנים
        </Typography>
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>טווח תקציב</FormLabel>
              <RadioGroup
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
                <FormControlLabel value="עד 10,000" control={<Radio />} label="עד ₪10,000" />
                <FormControlLabel value="10,000-20,000" control={<Radio />} label="₪10,000-20,000" />
                <FormControlLabel value="20,000-40,000" control={<Radio />} label="₪20,000-40,000" />
                <FormControlLabel value="40,000-60,000" control={<Radio />} label="₪40,000-60,000" />
                <FormControlLabel value="60,000+" control={<Radio />} label="₪60,000+" />
                <FormControlLabel value="לא בטוח" control={<Radio />} label="לא בטוח" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="תאריך יעד להטמעה"
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
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>רמת דחיפות</FormLabel>
              <RadioGroup
                value={formData.budgetAndTimeline?.urgencyLevel || 'medium'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetAndTimeline: {
                      ...formData.budgetAndTimeline,
                      urgencyLevel: e.target.value
                    }
                  })
                }
              >
                <FormControlLabel value="low" control={<Radio />} label="נמוכה" />
                <FormControlLabel value="medium" control={<Radio />} label="בינונית" />
                <FormControlLabel value="high" control={<Radio />} label="גבוהה" />
                <FormControlLabel value="urgent" control={<Radio />} label="דחופה" />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 8. סיכום והמשך */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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
              label="לקבוע פגישת הצגת פתרון"
            />
          </Grid>
          {formData.nextSteps?.proposalPresentation && (
            <Grid item xs={12} md={6}>
              <TextField
                label="תאריך פגישה מועדף"
                type="date"
                value={formData.nextSteps?.preferredMeetingDate?.split('T')[0] || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nextSteps: {
                      ...formData.nextSteps,
                      preferredMeetingDate: e.target.value
                    }
                  })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              label="הערות נוספות"
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">ניתוח אוטומטי (AI) והמלצות</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={buildAiRecommendation}>
              הפעל ניתוח
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              שמור שאלון אפיון
            </Button>
          </Box>
        </Box>
        <Typography
          variant="body2"
          color={aiSummary ? 'text.primary' : 'text.secondary'}
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {aiSummary ||
            'מלא את השאלון ולחץ על \"הפעל ניתוח\" כדי לקבל המלצה אוטומטית ותצוגה מקדימה של מערכת מומלצת לעסק.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AssessmentTab;

