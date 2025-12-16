import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Checkbox
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import { adminUsersAPI } from '../utils/api';

const MODULES = [
  { key: 'clients', label: 'לקוחות' },
  { key: 'leads', label: 'לידים' },
  { key: 'tasks_calendar', label: 'יומן ומשימות' },
  { key: 'marketing', label: 'שיווק' },
  { key: 'cms', label: 'CMS' },
  { key: 'invoices_docs', label: 'חשבוניות/מסמכים/הצעות' },
  { key: 'settings', label: 'הגדרות' }
];

const emptyPermissions = () =>
  MODULES.reduce((acc, m) => {
    acc[m.key] = { enabled: false, viewAll: false };
    return acc;
  }, {});

const EmployeesPage = () => {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const [createForm, setCreateForm] = React.useState({
    username: '',
    password: '',
    isActive: true,
    role: 'employee',
    permissions: emptyPermissions()
  });

  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);

  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetUser, setResetUser] = React.useState(null);
  const [newPassword, setNewPassword] = React.useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminUsersAPI.list();
      setUsers(res.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בטעינת עובדים');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    setError('');
    setSuccess('');
    try {
      await adminUsersAPI.create({
        username: createForm.username,
        password: createForm.password,
        role: 'employee',
        isActive: Boolean(createForm.isActive),
        permissions: createForm.permissions
      });
      setSuccess('עובד נוצר');
      setCreateForm({ username: '', password: '', isActive: true, role: 'employee', permissions: emptyPermissions() });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה ביצירת עובד');
    }
  };

  const openEdit = (u) => {
    setEditUser({
      _id: u._id,
      username: u.username || '',
      role: u.role || 'employee',
      isActive: Boolean(u.isActive),
      permissions: {
        ...emptyPermissions(),
        ...(u.permissions || {})
      }
    });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editUser?._id) return;
    setError('');
    setSuccess('');
    try {
      await adminUsersAPI.update(editUser._id, {
        username: editUser.username,
        isActive: editUser.isActive,
        role: editUser.role,
        permissions: editUser.permissions
      });
      setSuccess('עודכן בהצלחה');
      setEditOpen(false);
      setEditUser(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בעדכון עובד');
    }
  };

  const openReset = (u) => {
    setResetUser(u);
    setNewPassword('');
    setResetOpen(true);
  };

  const onResetPassword = async () => {
    if (!resetUser?._id) return;
    setError('');
    setSuccess('');
    try {
      await adminUsersAPI.resetPassword(resetUser._id, { newPassword });
      setSuccess('סיסמה אופסה');
      setResetOpen(false);
      setResetUser(null);
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה באיפוס סיסמה');
    }
  };

  const renderPermissionsEditor = (value, onChange) => (
    <Grid container spacing={1}>
      {MODULES.map((m) => (
        <Grid item xs={12} md={6} key={m.key}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: 'grey.100' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>{m.label}</Typography>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={Boolean(value?.[m.key]?.enabled)}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      onChange({
                        ...value,
                        [m.key]: { ...(value?.[m.key] || {}), enabled }
                      });
                    }}
                  />
                }
                label=""
              />
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(value?.[m.key]?.viewAll)}
                  disabled={!value?.[m.key]?.enabled}
                  onChange={(e) => {
                    const viewAll = e.target.checked;
                    onChange({
                      ...value,
                      [m.key]: { ...(value?.[m.key] || {}), viewAll }
                    });
                  }}
                />
              }
              label="רואה הכל"
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const summarizePerms = (p) => {
    const enabled = MODULES.filter((m) => p?.[m.key]?.enabled).map((m) => m.label);
    return enabled.length ? enabled.join(', ') : 'ללא הרשאות';
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        עובדים והרשאות
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        יצירת עובדים עם הרשאות מוגבלות וניהול סיסמאות.
      </Typography>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
        <Typography fontWeight={800} sx={{ mb: 1.5 }}>יצירת עובד</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="שם משתמש"
              value={createForm.username}
              onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="סיסמה ראשונית"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              helperText="לפחות 8 תווים"
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(createForm.isActive)}
                  onChange={(e) => setCreateForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
              }
              label="פעיל"
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            {renderPermissionsEditor(createForm.permissions, (permissions) => setCreateForm((p) => ({ ...p, permissions })))}
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SaveIcon />}
              onClick={onCreate}
              disabled={loading || !createForm.username || !createForm.password}
            >
              צור עובד
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography fontWeight={800}>רשימת משתמשים</Typography>
          <Button variant="outlined" onClick={load} disabled={loading}>
            רענן
          </Button>
        </Stack>
        {loading ? (
          <Typography color="text.secondary">טוען…</Typography>
        ) : (
          <Stack spacing={1.5}>
            {users.map((u) => (
              <Paper key={u._id} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'grey.100' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={800}>{u.username}</Typography>
                      <Chip size="small" label={u.role === 'admin' ? 'אדמין' : 'עובד'} color={u.role === 'admin' ? 'primary' : 'default'} />
                      <Chip size="small" label={u.isActive ? 'פעיל' : 'לא פעיל'} color={u.isActive ? 'success' : 'warning'} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {summarizePerms(u.permissions)}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => openEdit(u)}>
                      ערוך
                    </Button>
                    <Button variant="outlined" startIcon={<LockResetIcon />} onClick={() => openReset(u)}>
                      איפוס סיסמה
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {users.length === 0 ? <Typography color="text.secondary">אין משתמשים עדיין.</Typography> : null}
          </Stack>
        )}
      </Paper>

      {/* Edit */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>עריכת עובד</DialogTitle>
        <DialogContent dividers>
          {editUser ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="שם משתמש"
                  value={editUser.username}
                  onChange={(e) => setEditUser((p) => ({ ...p, username: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="תפקיד"
                  value={editUser.role}
                  onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value }))}
                >
                  <MenuItem value="employee">עובד</MenuItem>
                  <MenuItem value="admin">אדמין</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(editUser.isActive)}
                      onChange={(e) => setEditUser((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                  }
                  label="פעיל"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                {renderPermissionsEditor(editUser.permissions, (permissions) => setEditUser((p) => ({ ...p, permissions })))}
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" color="secondary" onClick={onSaveEdit} disabled={!editUser?.username}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset password */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>איפוס סיסמה</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {resetUser ? `משתמש: ${resetUser.username}` : ''}
          </Typography>
          <TextField
            fullWidth
            label="סיסמה חדשה"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="לפחות 8 תווים"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>ביטול</Button>
          <Button variant="contained" color="secondary" onClick={onResetPassword} disabled={!newPassword || newPassword.length < 8}>
            איפוס
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesPage;

