import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Close as CloseIcon } from '@mui/icons-material';

const REFERRER_STATUSES = [
  { value: 'prospecting', label: 'מתעניינים' },
  { value: 'contacted', label: 'נוצר קשר' },
  { value: 'negotiating', label: 'במשא ומתן' },
  { value: 'active', label: 'פעיל' },
  { value: 'inactive', label: 'לא פעיל' },
];

const REFERRER_CATEGORIES = [
  { value: 'business_consultant', label: 'יועץ עסקי' },
  { value: 'accountant', label: 'רו״ח' },
  { value: 'lawyer', label: 'עו״ד' },
  { value: 'other', label: 'אחר' },
];

const labelBy = (list, value) => list.find((x) => x.value === value)?.label || value || '—';

const HuntingPoolsReferrersTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    displayName: '',
    category: 'other',
    phone: '',
    email: '',
  });

  const [active, setActive] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    displayName: '',
    category: 'other',
    status: 'prospecting',
    phone: '',
    email: '',
    worksWith: '',
    cooperationTerms: '',
    commissionModel: '',
    notes: '',
  });
  const [saving, setSaving] = React.useState(false);

  const [closeOpen, setCloseOpen] = React.useState(false);
  const [closeForm, setCloseForm] = React.useState({ status: 'active', summary: '', notes: '' });
  const [closing, setClosing] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/referrer-partners', { params: search ? { search } : undefined });
      setItems(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בטעינת מפנים');
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const openCard = (r) => {
    setActive(r);
    setEditForm({
      displayName: r?.displayName || '',
      category: r?.category || 'other',
      status: r?.status || 'prospecting',
      phone: r?.contact?.phone || '',
      email: r?.contact?.email || '',
      worksWith: r?.worksWith || '',
      cooperationTerms: r?.cooperationTerms || '',
      commissionModel: r?.commissionModel || '',
      notes: r?.notes || '',
    });
  };

  const syncInState = (updated) => {
    setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
    setActive(updated);
  };

  const handleCreate = async () => {
    const displayName = (createForm.displayName || '').trim();
    if (!displayName) return toast.error('חובה למלא שם');
    try {
      setCreating(true);
      const res = await api.post('/referrer-partners', {
        displayName,
        category: createForm.category,
        contact: { phone: createForm.phone || '', email: createForm.email || '' },
        status: 'prospecting',
      });
      const created = res?.data?.data;
      toast.success('מפנה נוצר');
      setCreateOpen(false);
      setCreateForm({ displayName: '', category: 'other', phone: '', email: '' });
      setItems((prev) => {
        const next = [created, ...prev].filter(Boolean);
        next.sort((a, b) => String(a.displayName || '').localeCompare(String(b.displayName || ''), 'he'));
        return next;
      });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה ביצירת מפנה');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!active?._id) return;
    const displayName = (editForm.displayName || '').trim();
    if (!displayName) return toast.error('חובה למלא שם');
    try {
      setSaving(true);
      const res = await api.patch(`/referrer-partners/${active._id}`, {
        displayName,
        category: editForm.category,
        status: editForm.status,
        contact: { phone: editForm.phone || '', email: editForm.email || '' },
        worksWith: editForm.worksWith || '',
        cooperationTerms: editForm.cooperationTerms || '',
        commissionModel: editForm.commissionModel || '',
        notes: editForm.notes || '',
      });
      syncInState(res?.data?.data);
      toast.success('נשמר');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseReferrer = async () => {
    if (!active?._id) return;
    try {
      setClosing(true);
      const res = await api.post(`/referrer-partners/${active._id}/close`, {
        status: closeForm.status,
        summary: closeForm.summary || '',
        notes: closeForm.notes || '',
      });
      syncInState(res?.data?.data);
      setCloseOpen(false);
      setCloseForm({ status: 'active', summary: '', notes: '' });
      toast.success('נסגר');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'שגיאה בסגירה');
    } finally {
      setClosing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>מפנים</Typography>
          <Typography variant="body2" color="text.secondary">מאגר יועצים/רו״ח/שותפים שמפנים אליך לידים</Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            size="small"
            placeholder="חיפוש לפי שם/טלפון/אימייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { xs: '100%', md: 320 } }}
          />
          <Button variant="outlined" onClick={refresh} sx={{ width: { xs: '100%', md: 'auto' } }}>
            חפש
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)} sx={{ width: { xs: '100%', md: 'auto' } }}>
            הוסף מפנה
          </Button>
        </Stack>
      </Box>

      {isMobile ? (
        <Stack spacing={1.5}>
          {items.map((r) => (
            <Paper key={r._id} variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={800} noWrap>{r.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {labelBy(REFERRER_CATEGORIES, r.category)} • {r.contact?.phone || '—'}
                  </Typography>
                </Box>
                <Chip size="small" label={labelBy(REFERRER_STATUSES, r.status)} />
              </Box>
              <Button fullWidth size="small" variant="outlined" sx={{ mt: 1.25 }} onClick={() => openCard(r)}>
                פתח כרטיס
              </Button>
            </Paper>
          ))}

          {!loading && items.length === 0 ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">אין מפנים עדיין.</Typography>
            </Paper>
          ) : null}

          {loading ? (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">טוען...</Typography>
            </Paper>
          ) : null}
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 920 }}>
              <TableHead>
                <TableRow>
                  <TableCell>שם</TableCell>
                  <TableCell>קטגוריה</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>טלפון</TableCell>
                  <TableCell>אימייל</TableCell>
                  <TableCell align="left">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>{r.displayName}</TableCell>
                    <TableCell>{labelBy(REFERRER_CATEGORIES, r.category)}</TableCell>
                    <TableCell><Chip size="small" label={labelBy(REFERRER_STATUSES, r.status)} /></TableCell>
                    <TableCell>{r.contact?.phone || '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.contact?.email || '—'}
                    </TableCell>
                    <TableCell align="left">
                      <Button size="small" variant="outlined" onClick={() => openCard(r)}>
                        פתח
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>אין מפנים עדיין.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>טוען...</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>הוספת מפנה</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם"
              value={createForm.displayName}
              onChange={(e) => setCreateForm((p) => ({ ...p, displayName: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="קטגוריה"
              value={createForm.category}
              onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
              fullWidth
            >
              {REFERRER_CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="טלפון"
              value={createForm.phone}
              onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
              fullWidth
            />
            <TextField
              label="אימייל"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            צור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card dialog */}
      <Dialog open={!!active} onClose={() => setActive(null)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography fontWeight={800}>{active?.displayName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {labelBy(REFERRER_CATEGORIES, active?.category)} • {labelBy(REFERRER_STATUSES, active?.status)}
            </Typography>
          </Box>
          <IconButton onClick={() => setActive(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="שם"
                value={editForm.displayName}
                onChange={(e) => setEditForm((p) => ({ ...p, displayName: e.target.value }))}
                fullWidth
              />
              <TextField
                select
                label="קטגוריה"
                value={editForm.category}
                onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                fullWidth
              >
                {REFERRER_CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="סטטוס"
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                fullWidth
              >
                {REFERRER_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="טלפון"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                fullWidth
              />
              <TextField
                label="אימייל"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="עם מי עובד"
              value={editForm.worksWith}
              onChange={(e) => setEditForm((p) => ({ ...p, worksWith: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="תנאי שיתוף פעולה"
              value={editForm.cooperationTerms}
              onChange={(e) => setEditForm((p) => ({ ...p, cooperationTerms: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="מודל תגמול/עמלה"
              value={editForm.commissionModel}
              onChange={(e) => setEditForm((p) => ({ ...p, commissionModel: e.target.value }))}
              fullWidth
            />
            <TextField
              label="הערות"
              value={editForm.notes}
              onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />

            <Divider />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" fontWeight={800}>סגירה</Typography>
                <Typography variant="body2" color="text.secondary">
                  {active?.closing?.closedAt ? `נסגר: ${new Date(active.closing.closedAt).toLocaleDateString('he-IL')}` : 'טרם נסגר'}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="success"
                onClick={() => setCloseOpen(true)}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                סגור שיתוף פעולה
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActive(null)}>סגור</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close dialog */}
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>סגירת שיתוף פעולה</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="סטטוס אחרי סגירה"
              value={closeForm.status}
              onChange={(e) => setCloseForm((p) => ({ ...p, status: e.target.value }))}
              fullWidth
            >
              <MenuItem value="active">פעיל</MenuItem>
              <MenuItem value="inactive">לא פעיל</MenuItem>
            </TextField>
            <TextField
              label="סיכום"
              value={closeForm.summary}
              onChange={(e) => setCloseForm((p) => ({ ...p, summary: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="הערות"
              value={closeForm.notes}
              onChange={(e) => setCloseForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseOpen(false)}>ביטול</Button>
          <Button variant="contained" color="success" onClick={handleCloseReferrer} disabled={closing}>
            אישור סגירה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HuntingPoolsReferrersTab;



