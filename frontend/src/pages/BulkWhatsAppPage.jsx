import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CheckBox as CheckBoxIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { whatsappAPI, clientAPI } from '../admin/utils/api';
import { cardSection } from '../admin/styles/cardStyles';

const VIEW_MODES = [
  { value: 'all', label: 'כולם (לידים + לקוחות)' },
  { value: 'leads', label: 'לידים בלבד' },
  { value: 'clients', label: 'לקוחות בלבד' },
];

const ALL_STATUS_OPTIONS = [
  { value: '', label: 'כל הסטטוסים' },
  { value: 'new_lead', label: 'ליד חדש' },
  { value: 'contacted', label: 'יצרנו קשר' },
  { value: 'engaged', label: 'מעורבות' },
  { value: 'meeting_set', label: 'פגישה נקבעה' },
  { value: 'proposal_sent', label: 'הצעה נשלחה' },
  { value: 'won', label: 'נסגר (לקוח)' },
  { value: 'lost', label: 'הפסדנו' },
];

const getStatusOptions = (viewMode) => {
  if (viewMode === 'leads') return ALL_STATUS_OPTIONS.filter((o) => !o.value || o.value !== 'won');
  if (viewMode === 'clients') return ALL_STATUS_OPTIONS.filter((o) => !o.value || o.value === 'won');
  return ALL_STATUS_OPTIONS;
};

// מיפוי viewMode ל-status עבור clientAPI.getAll
const getStatusParamForViewMode = (viewMode, statusFilter) => {
  if (statusFilter) return statusFilter;
  if (viewMode === 'leads') return 'new_lead,contacted,engaged,meeting_set,proposal_sent,lost';
  if (viewMode === 'clients') return 'won';
  return '';
};

const BulkWhatsAppPage = () => {
  const [selectionMode, setSelectionMode] = useState('filter'); // 'filter' | 'select'
  const [viewMode, setViewMode] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // בחירה ידנית
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchInList, setSearchInList] = useState('');

  const fetchCandidates = useCallback(async () => {
    setError(null);
    setLoadingCandidates(true);
    try {
      const params = { limit: 500 };
      const statusParam = getStatusParamForViewMode(viewMode, statusFilter);
      if (statusParam) params.status = statusParam;
      const res = await clientAPI.getAll(params);
      const list = res.data?.data || [];
      setCandidates(list);
      setSelectedIds(new Set());
      setPreview(null);
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בטעינת הרשימה');
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, [viewMode, statusFilter]);

  const filteredCandidates = useMemo(() => {
    if (!searchInList.trim()) return candidates;
    const q = searchInList.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        (c.personalInfo?.fullName || '').toLowerCase().includes(q) ||
        (c.businessInfo?.businessName || '').toLowerCase().includes(q) ||
        (c.personalInfo?.phone || '').includes(q)
    );
  }, [candidates, searchInList]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPreview(null);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredCandidates.map((c) => c._id)));
    setPreview(null);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setPreview(null);
  };

  const fetchPreview = useCallback(async () => {
    setError(null);
    setLoadingPreview(true);
    try {
      let params = {};
      if (selectionMode === 'select' && selectedIds.size > 0) {
        params.clientIds = Array.from(selectedIds).join(',');
      } else {
        params.viewMode = viewMode;
        if (statusFilter) params.status = statusFilter;
      }
      const res = await whatsappAPI.previewBulk(params);
      if (res.data?.success) {
        setPreview(res.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בטעינת תצוגה מקדימה');
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [selectionMode, viewMode, statusFilter, selectedIds]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('נא להזין הודעה');
      return;
    }
    // בדיקת תצוגה מקדימה לפני אישור - אם אין לנו, נשלוף
    let countToShow = preview?.count;
    if (countToShow == null) {
      try {
        let params = {};
        if (selectionMode === 'select' && selectedIds.size > 0) {
          params.clientIds = Array.from(selectedIds).join(',');
        } else {
          params.viewMode = viewMode;
          if (statusFilter) params.status = statusFilter;
        }
        const preRes = await whatsappAPI.previewBulk(params);
        countToShow = preRes.data?.success ? preRes.data.data?.count : null;
        if (preRes.data?.success) setPreview(preRes.data.data);
      } catch {
        countToShow = null;
      }
    }
    if (countToShow === 0 || countToShow == null) {
      setError('לא נמצאו נמענים לשליחה. נא לבדוק את הסינון או הבחירה.');
      return;
    }
    if (!window.confirm(`האם לשלוח את ההודעה ל-${countToShow} נמענים?`)) return;

    setError(null);
    setSending(true);
    setResult(null);
    try {
      const payload = { message: message.trim() };
      if (selectionMode === 'select' && selectedIds.size > 0) {
        payload.clientIds = Array.from(selectedIds);
      } else {
        payload.viewMode = viewMode;
        if (statusFilter) payload.status = [statusFilter];
      }
      const res = await whatsappAPI.sendBulk(payload);
      if (res.data?.success) {
        setResult(res.data.data);
        setMessage('');
        setPreview(null);
        setSelectedIds(new Set());
      } else {
        setError(res.data?.message || 'שגיאה בשליחה');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'שגיאה בשליחת ההודעות');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsAppIcon sx={{ color: '#25D366' }} />
        שליחת WhatsApp מרובה
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        שלח הודעה ללקוחות ולידים. ניתן להגדיר למי לשלוח ולפרסם את השם עם {'{name}'}.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={cardSection}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          בחירת נמענים
        </Typography>

        <ToggleButtonGroup
          value={selectionMode}
          exclusive
          onChange={(_, v) => v != null && (setSelectionMode(v), setPreview(null), setCandidates([]))}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="filter">
            <FilterIcon sx={{ mr: 0.5 }} /> סינון לפי קריטריונים
          </ToggleButton>
          <ToggleButton value="select">
            <CheckBoxIcon sx={{ mr: 0.5 }} /> בחירה ידנית
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>שליחה ל</InputLabel>
            <Select
              value={viewMode}
              label="שליחה ל"
              onChange={(e) => {
                setViewMode(e.target.value);
                setPreview(null);
              }}
            >
              {VIEW_MODES.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>סטטוס (אופציונלי)</InputLabel>
            <Select
              value={statusFilter}
              label="סטטוס (אופציונלי)"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPreview(null);
              }}
            >
              {getStatusOptions(viewMode).map((o) => (
                <MenuItem key={o.value || 'all'} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectionMode === 'select' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={fetchCandidates}
                disabled={loadingCandidates}
                startIcon={loadingCandidates ? <CircularProgress size={20} /> : null}
              >
                {loadingCandidates ? 'טוען...' : 'טען רשימה לבחירה'}
              </Button>
              {candidates.length > 0 && (
                <>
                  <TextField
                    size="small"
                    placeholder="חיפוש בשם, עסק או טלפון..."
                    value={searchInList}
                    onChange={(e) => setSearchInList(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined" onClick={selectAll}>
                      בחר הכל ({filteredCandidates.length})
                    </Button>
                    <Button size="small" variant="outlined" onClick={clearSelection}>
                      נקה בחירה
                    </Button>
                    <Chip
                      size="small"
                      label={`נבחרו ${selectedIds.size}`}
                      color={selectedIds.size > 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <List dense disablePadding>
                      {filteredCandidates.slice(0, 100).map((c) => {
                        const name = c.personalInfo?.fullName || c.businessInfo?.businessName || 'ללא שם';
                        const sub = c.businessInfo?.businessName && c.personalInfo?.fullName
                          ? c.businessInfo.businessName
                          : (c.personalInfo?.phone || '');
                        const hasPhone =
                          (c.personalInfo?.whatsappPhone || c.personalInfo?.phone || '').replace(/\D/g, '').length >= 9;
                        return (
                          <ListItem key={c._id} disablePadding>
                            <ListItemButton
                              dense
                              onClick={() => hasPhone && toggleSelect(c._id)}
                              disabled={!hasPhone}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Checkbox
                                  edge="start"
                                  checked={selectedIds.has(c._id)}
                                  disabled={!hasPhone}
                                  tabIndex={-1}
                                  disableRipple
                                  size="small"
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={name}
                                secondary={!hasPhone ? 'אין טלפון' : sub}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                    {filteredCandidates.length > 100 && (
                      <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block' }}>
                        מוצגים 100 ראשונים מתוך {filteredCandidates.length} - השתמש בחיפוש לצמצום
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}

          <Button
            variant="outlined"
            startIcon={loadingPreview ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={fetchPreview}
            disabled={loadingPreview || (selectionMode === 'select' && selectedIds.size === 0)}
          >
            בדוק כמה נמענים
          </Button>
        </Box>

        {preview && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${preview.count} נמענים`}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            {preview.sample?.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                לדוגמה: {preview.sample.map((s) => `${s.name} (****${s.phone})`).join(', ')}
              </Typography>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          ההודעה
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="לדוגמה: חג שמח {name}! אנו מאחלים לך חג אורות שמח 🕎"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          helperText="השתמש ב־{name} כדי להוסיף את השם האישי בכל הודעה"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSend}
            disabled={
              sending ||
              !message.trim() ||
              (selectionMode === 'select' && selectedIds.size === 0)
            }
          >
            {sending ? 'שולח...' : 'שלח הודעה'}
          </Button>
          <Button variant="outlined" onClick={fetchPreview} disabled={loadingPreview}>
            רענן תצוגה מקדימה
          </Button>
        </Box>
      </Paper>

      {result && (
        <Paper sx={{ ...cardSection, mt: 3, bgcolor: 'success.50' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            תוצאות
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${result.sent} נשלחו בהצלחה`} color="success" />
            {result.failed > 0 && (
              <Chip label={`${result.failed} נכשלו`} color="error" />
            )}
          </Box>
          {result.errors?.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              שגיאות: {result.errors.map((e) => `${e.name}: ${e.error}`).join('; ')}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default BulkWhatsAppPage;
