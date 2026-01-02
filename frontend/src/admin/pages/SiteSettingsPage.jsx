import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { adminSiteSettingsAPI, authAPI } from '../utils/api';

const empty = {
  company: { name: '', tagline: '' },
  contact: { email: '', phone: '', whatsapp: '', address: '' },
  socials: { facebook: '', instagram: '', linkedin: '', tiktok: '', youtube: '', twitter: '' },
  hours: { sundayToThursday: '', friday: '' },
  stats: {
    hoursSaved: { value: 10, suffix: '+', label: 'שעות חיסכון שבועי' },
    satisfaction: { value: 95, suffix: '%', label: 'שביעות רצון' },
    businesses: { value: 500, suffix: '+', label: 'עסקים משתמשים' },
    support: { value: 24, suffix: '/7', label: 'תמיכה' }
  },
  showClientsInNav: false,
  showClientsOnHome: false
};

function SiteSettingsPage() {
  const [form, setForm] = React.useState(empty);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // אבטחה
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminSiteSettingsAPI.get();
        const data = res.data?.data;
        if (!mounted) return;
        setForm({
          company: { ...empty.company, ...(data?.company || {}) },
          contact: { ...empty.contact, ...(data?.contact || {}) },
          socials: { ...empty.socials, ...(data?.socials || {}) },
          hours: { ...empty.hours, ...(data?.hours || {}) },
          stats: { ...empty.stats, ...(data?.stats || {}) },
          showClientsInNav: data?.showClientsInNav !== undefined ? data.showClientsInNav : false,
          showClientsOnHome: data?.showClientsOnHome !== undefined ? data.showClientsOnHome : false,
        });
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'שגיאה בטעינת ההגדרות');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const setNested = (section, field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const onSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await adminSiteSettingsAPI.update({
        company: form.company,
        contact: form.contact,
        socials: form.socials,
        hours: form.hours,
        stats: form.stats,
        showClientsInNav: form.showClientsInNav,
        showClientsOnHome: form.showClientsOnHome,
      });
      setSuccess('נשמר בהצלחה');
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!currentPassword || !newPassword) {
      setError('נא למלא סיסמה נוכחית וסיסמה חדשה');
      return;
    }
    if (newPassword.length < 8) {
      setError('סיסמה חדשה חייבת להיות לפחות 8 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('אימות סיסמה לא תואם');
      return;
    }

    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setSuccess('הסיסמה עודכנה בהצלחה');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בשינוי סיסמה');
    } finally {
      setSavingPassword(false);
    }
  };

  const onLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      window.location.href = '/admin/login';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        הגדרות אתר
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        כאן מגדירים את פרטי הקשר והרשתות החברתיות שמופיעים בפוטר ובדף "צור קשר".
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              חברה
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שם חברה"
              value={form.company.name}
              onChange={setNested('company', 'name')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="סלוגן (אופציונלי)"
              value={form.company.tagline}
              onChange={setNested('company', 'tagline')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              פרטי קשר
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="אימייל"
              value={form.contact.email}
              onChange={setNested('contact', 'email')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="טלפון"
              value={form.contact.phone}
              onChange={setNested('contact', 'phone')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ווצאפ"
              helperText='אפשר מספר/קישור. לדוגמה: "+972501234567"'
              value={form.contact.whatsapp}
              onChange={setNested('contact', 'whatsapp')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="כתובת"
              value={form.contact.address}
              onChange={setNested('contact', 'address')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              רשתות חברתיות
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Facebook"
              value={form.socials.facebook}
              onChange={setNested('socials', 'facebook')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Instagram"
              value={form.socials.instagram}
              onChange={setNested('socials', 'instagram')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="LinkedIn"
              value={form.socials.linkedin}
              onChange={setNested('socials', 'linkedin')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="TikTok"
              value={form.socials.tiktok}
              onChange={setNested('socials', 'tiktok')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="YouTube"
              value={form.socials.youtube}
              onChange={setNested('socials', 'youtube')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twitter/X"
              value={form.socials.twitter}
              onChange={setNested('socials', 'twitter')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              הצגת תוכן
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.showClientsInNav}
                  onChange={(e) => setForm(prev => ({ ...prev, showClientsInNav: e.target.checked }))}
                  disabled={loading}
                />
              }
              label="הצגת קישור ללקוחות בהדר ובפוטר"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
              כאשר הטוגל פעיל, קישור "לקוחות" יוצג בתפריט הניווט העליון ובפוטר
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.showClientsOnHome}
                  onChange={(e) => setForm(prev => ({ ...prev, showClientsOnHome: e.target.checked }))}
                  disabled={loading}
                />
              }
              label="הצגת לקוחות בדף הבית"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
              כאשר הטוגל פעיל, רכיב הלקוחות יוצג בדף הבית
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              שעות פעילות
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='ראשון-חמישי'
              value={form.hours.sundayToThursday}
              onChange={setNested('hours', 'sundayToThursday')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='שישי'
              value={form.hours.friday}
              onChange={setNested('hours', 'friday')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" fontWeight={700}>
              נתונים סטטיסטיים (מוצגים בעמוד הבית)
            </Typography>
            <Divider sx={{ mt: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              הסקשן יוצג רק אם יש לפחות 10 לקוחות במערכת
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שעות חיסכון שבועי - ערך"
              type="number"
              value={form.stats.hoursSaved.value}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  hoursSaved: { ...prev.stats.hoursSaved, value: parseInt(e.target.value) || 0 }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="סיומת"
              value={form.stats.hoursSaved.suffix}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  hoursSaved: { ...prev.stats.hoursSaved, suffix: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="תווית"
              value={form.stats.hoursSaved.label}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  hoursSaved: { ...prev.stats.hoursSaved, label: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שביעות רצון - ערך"
              type="number"
              value={form.stats.satisfaction.value}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  satisfaction: { ...prev.stats.satisfaction, value: parseInt(e.target.value) || 0 }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="סיומת"
              value={form.stats.satisfaction.suffix}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  satisfaction: { ...prev.stats.satisfaction, suffix: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="תווית"
              value={form.stats.satisfaction.label}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  satisfaction: { ...prev.stats.satisfaction, label: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="עסקים משתמשים - ערך"
              type="number"
              value={form.stats.businesses.value}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  businesses: { ...prev.stats.businesses, value: parseInt(e.target.value) || 0 }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="סיומת"
              value={form.stats.businesses.suffix}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  businesses: { ...prev.stats.businesses, suffix: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="תווית"
              value={form.stats.businesses.label}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  businesses: { ...prev.stats.businesses, label: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תמיכה - ערך"
              type="number"
              value={form.stats.support.value}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  support: { ...prev.stats.support, value: parseInt(e.target.value) || 0 }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="סיומת"
              value={form.stats.support.suffix}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  support: { ...prev.stats.support, suffix: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="תווית"
              value={form.stats.support.label}
              onChange={(e) => setForm(prev => ({
                ...prev,
                stats: {
                  ...prev.stats,
                  support: { ...prev.stats.support, label: e.target.value }
                }
              }))}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={onSave}
                disabled={loading || saving}
              >
                {saving ? 'שומר…' : 'שמירה'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          אבטחה
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="סיסמה נוכחית"
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPasswords((p) => !p)} edge="end">
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="סיסמה חדשה"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="לפחות 8 תווים"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPasswords((p) => !p)} edge="end">
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="אימות סיסמה חדשה"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPasswords((p) => !p)} edge="end">
                      {showPasswords ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" color="error" onClick={onLogout}>
              התנתק
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={onChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? 'מעדכן…' : 'עדכן סיסמה'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default SiteSettingsPage;
