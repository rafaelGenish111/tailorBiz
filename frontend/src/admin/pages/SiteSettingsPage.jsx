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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { adminSiteSettingsAPI } from '../utils/api';

const empty = {
  company: { name: '', tagline: '' },
  contact: { email: '', phone: '', whatsapp: '', address: '' },
  socials: { facebook: '', instagram: '', linkedin: '', tiktok: '', youtube: '', twitter: '' },
  hours: { sundayToThursday: '', friday: '' },
};

function SiteSettingsPage() {
  const [form, setForm] = React.useState(empty);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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
      });
      setSuccess('נשמר בהצלחה');
    } catch (e) {
      setError(e?.response?.data?.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
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
    </Box>
  );
}

export default SiteSettingsPage;
