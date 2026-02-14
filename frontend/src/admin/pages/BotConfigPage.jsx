import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { adminBotConfigAPI } from '../utils/api';

function BotConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await adminBotConfigAPI.get();
        if (!mounted) return;
        setConfig(res.data?.data || null);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'שגיאה בטעינת הגדרות הבוט');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminBotConfigAPI.update(config);
      setConfig(res.data?.data || config);
      setSuccess('ההגדרות נשמרו בהצלחה!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  // Knowledge base helpers
  const addKBItem = () => {
    setConfig(prev => ({
      ...prev,
      knowledgeBase: [...(prev.knowledgeBase || []), { topic: '', content: '', enabled: true }]
    }));
  };

  const updateKBItem = (index, field, value) => {
    setConfig(prev => {
      const kb = [...(prev.knowledgeBase || [])];
      kb[index] = { ...kb[index], [field]: value };
      return { ...prev, knowledgeBase: kb };
    });
  };

  const removeKBItem = (index) => {
    setConfig(prev => ({
      ...prev,
      knowledgeBase: (prev.knowledgeBase || []).filter((_, i) => i !== index)
    }));
  };

  // FAQ helpers
  const addFAQItem = () => {
    setConfig(prev => ({
      ...prev,
      faqItems: [...(prev.faqItems || []), { question: '', answer: '', enabled: true }]
    }));
  };

  const updateFAQItem = (index, field, value) => {
    setConfig(prev => {
      const faq = [...(prev.faqItems || [])];
      faq[index] = { ...faq[index], [field]: value };
      return { ...prev, faqItems: faq };
    });
  };

  const removeFAQItem = (index) => {
    setConfig(prev => ({
      ...prev,
      faqItems: (prev.faqItems || []).filter((_, i) => i !== index)
    }));
  };

  // Restricted topics helpers
  const addRestrictedTopic = () => {
    setConfig(prev => ({
      ...prev,
      restrictedTopics: [...(prev.restrictedTopics || []), { topic: '', responseMessage: 'לא אוכל לענות על שאלות בנושא זה. אשמח להעביר אותך לנציג.' }]
    }));
  };

  const updateRestrictedTopic = (index, field, value) => {
    setConfig(prev => {
      const topics = [...(prev.restrictedTopics || [])];
      topics[index] = { ...topics[index], [field]: value };
      return { ...prev, restrictedTopics: topics };
    });
  };

  const removeRestrictedTopic = (index) => {
    setConfig(prev => ({
      ...prev,
      restrictedTopics: (prev.restrictedTopics || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">לא נמצאה תצורת בוט. נסה לרענן את הדף.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SmartToyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight={700}>הגדרות בוט AI</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* General Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>הגדרות כלליות</Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={config.websiteChat?.enabled ?? true}
                onChange={e => setConfig(prev => ({
                  ...prev,
                  websiteChat: { ...prev.websiteChat, enabled: e.target.checked }
                }))}
              />
            }
            label="הפעל צ'אט באתר"
          />

          <TextField
            label="שם הבוט (מוצג בצ'אט)"
            value={config.websiteChat?.botName || ''}
            onChange={e => setConfig(prev => ({
              ...prev,
              websiteChat: { ...prev.websiteChat, botName: e.target.value }
            }))}
            fullWidth
          />

          <TextField
            label="הודעת פתיחה"
            value={config.websiteChat?.welcomeMessage || ''}
            onChange={e => setConfig(prev => ({
              ...prev,
              websiteChat: { ...prev.websiteChat, welcomeMessage: e.target.value }
            }))}
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>מודל AI</InputLabel>
              <Select
                value={config.model || 'gpt-4o-mini'}
                label="מודל AI"
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
              >
                <MenuItem value="gpt-4o-mini">GPT-4o Mini (מהיר וזול)</MenuItem>
                <MenuItem value="gpt-4">GPT-4 (חכם יותר)</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="מקסימום טוקנים"
              type="number"
              value={config.maxTokens || 500}
              onChange={e => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 500 }))}
              sx={{ width: 150 }}
              inputProps={{ min: 50, max: 4000 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              טמפרטורה (יצירתיות): {config.temperature ?? 0.7}
            </Typography>
            <Slider
              value={config.temperature ?? 0.7}
              onChange={(_, val) => setConfig(prev => ({ ...prev, temperature: val }))}
              min={0}
              max={1.5}
              step={0.1}
              marks={[
                { value: 0, label: 'מדויק' },
                { value: 0.7, label: 'מאוזן' },
                { value: 1.5, label: 'יצירתי' }
              ]}
            />
          </Box>
        </Box>
      </Paper>

      {/* System Prompt */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>הנחיית מערכת (System Prompt)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ההוראות הבסיסיות לבוט. כאן מגדירים את האישיות, הטון, והתנהגות הבוט.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <TextField
          value={config.systemPrompt || ''}
          onChange={e => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
          fullWidth
          multiline
          rows={6}
          placeholder="אתה עוזר AI של החברה שלנו. ענה בעברית, היה מקצועי וידידותי..."
        />
      </Paper>

      {/* Knowledge Base */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>מאגר ידע</Typography>
          <Button startIcon={<AddIcon />} size="small" onClick={addKBItem}>הוסף נושא</Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          הוסף מידע שהבוט יוכל להשתמש בו כדי לענות על שאלות. כל נושא הוא תחום ידע.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {(config.knowledgeBase || []).map((kb, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={kb.enabled !== false}
                    onChange={e => updateKBItem(i, 'enabled', e.target.checked)}
                  />
                }
                label={<Typography variant="body2">פעיל</Typography>}
              />
              <IconButton size="small" color="error" onClick={() => removeKBItem(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="נושא"
              value={kb.topic || ''}
              onChange={e => updateKBItem(i, 'topic', e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              label="תוכן"
              value={kb.content || ''}
              onChange={e => updateKBItem(i, 'content', e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Paper>
        ))}

        {(config.knowledgeBase || []).length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            אין נושאי ידע עדיין. לחץ "הוסף נושא" להתחיל.
          </Typography>
        )}
      </Paper>

      {/* FAQ */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>שאלות נפוצות (FAQ)</Typography>
          <Button startIcon={<AddIcon />} size="small" onClick={addFAQItem}>הוסף שאלה</Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          הגדר שאלות נפוצות ותשובות מוכנות מראש. הבוט ישתמש בהן בעדיפות.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {(config.faqItems || []).map((faq, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={faq.enabled !== false}
                    onChange={e => updateFAQItem(i, 'enabled', e.target.checked)}
                  />
                }
                label={<Typography variant="body2">פעיל</Typography>}
              />
              <IconButton size="small" color="error" onClick={() => removeFAQItem(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="שאלה"
              value={faq.question || ''}
              onChange={e => updateFAQItem(i, 'question', e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              label="תשובה"
              value={faq.answer || ''}
              onChange={e => updateFAQItem(i, 'answer', e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
          </Paper>
        ))}

        {(config.faqItems || []).length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            אין שאלות נפוצות עדיין. לחץ "הוסף שאלה" להתחיל.
          </Typography>
        )}
      </Paper>

      {/* Restricted Topics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>נושאים מוגבלים</Typography>
          <Button startIcon={<AddIcon />} size="small" onClick={addRestrictedTopic}>הוסף מגבלה</Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          נושאים שהבוט לא יענה עליהם (למשל: מחירים, פרטים טכניים). במקום זאת, ישלח את ההודעה המוגדרת.
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {(config.restrictedTopics || []).map((rt, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <IconButton size="small" color="error" onClick={() => removeRestrictedTopic(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              label="נושא מוגבל"
              value={rt.topic || ''}
              onChange={e => updateRestrictedTopic(i, 'topic', e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
              placeholder="למשל: מחירים, עלויות, תמחור"
            />
            <TextField
              label="הודעת תשובה"
              value={rt.responseMessage || ''}
              onChange={e => updateRestrictedTopic(i, 'responseMessage', e.target.value)}
              fullWidth
              size="small"
              placeholder="לא אוכל לענות על שאלות בנושא זה. אשמח להעביר אותך לנציג."
            />
          </Paper>
        ))}

        {(config.restrictedTopics || []).length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            אין נושאים מוגבלים. לחץ "הוסף מגבלה" כדי למנוע מהבוט לענות על נושאים מסוימים.
          </Typography>
        )}
      </Paper>

      {/* Conversation Rules */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>כללי שיחה</Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="אורך שיחה מקסימלי (מספר הודעות)"
            type="number"
            value={config.rules?.maxConversationLength || 20}
            onChange={e => setConfig(prev => ({
              ...prev,
              rules: { ...prev.rules, maxConversationLength: parseInt(e.target.value) || 20 }
            }))}
            inputProps={{ min: 5, max: 100 }}
            sx={{ maxWidth: 300 }}
          />

          <TextField
            label="מילות עצירה (מופרדות בפסיק)"
            value={(config.rules?.autoStopKeywords || []).join(', ')}
            onChange={e => setConfig(prev => ({
              ...prev,
              rules: { ...prev.rules, autoStopKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
            }))}
            fullWidth
            helperText="כשהמשתמש שולח אחת מהמילים האלה, השיחה תיפסק"
          />

          <TextField
            label="מילות העברה לנציג (מופרדות בפסיק)"
            value={(config.rules?.handoffToHumanKeywords || []).join(', ')}
            onChange={e => setConfig(prev => ({
              ...prev,
              rules: { ...prev.rules, handoffToHumanKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }
            }))}
            fullWidth
            helperText="כשהמשתמש שולח אחת מהמילים האלה, יועבר לנציג אנושי"
          />
        </Box>
      </Paper>

      {/* Stats */}
      {config.stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>סטטיסטיקות</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip label={`שיחות: ${config.stats.conversationsStarted || 0}`} />
            <Chip label={`הודעות: ${config.stats.totalMessages || 0}`} />
            <Chip label={`הושלמו: ${config.stats.conversationsCompleted || 0}`} color="success" />
            <Chip label={`הועברו לנציג: ${config.stats.conversationsHandedOff || 0}`} color="warning" />
            <Chip label={`ננטשו: ${config.stats.conversationsAbandoned || 0}`} color="error" />
          </Box>
        </Paper>
      )}

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? 'שומר...' : 'שמור הגדרות'}
        </Button>
      </Box>
    </Box>
  );
}

export default BotConfigPage;
