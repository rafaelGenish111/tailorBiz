import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { COMPANY_INFO } from '../utils/constants';
import { publicCMS, publicLeads } from '../utils/publicApi';
import Button from '../components/ui/Button';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await publicCMS.getSiteSettings();
        if (!mounted) return;
        setSettings(res.data?.data || null);
      } catch (_) {
        if (!mounted) return;
        setSettings(null);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const email = settings?.contact?.email || COMPANY_INFO.email;
  const phone = settings?.contact?.phone || COMPANY_INFO.phone;
  const whatsapp = settings?.contact?.whatsapp || '';
  const address = settings?.contact?.address || COMPANY_INFO.address;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      await publicLeads.submit(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        'שגיאה בשליחת הטופס. נסו שוב.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ color: '#000000' }}>
            צרו קשר
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 700, mx: 'auto', color: '#000000', opacity: 0.9 }}>
            נשמח לענות על כל שאלה ולעזור לכם להתחיל
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                שלחו לנו הודעה
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                מלאו את הפרטים ונחזור אליכם בהקדם
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  תודה על פנייתך! נחזור אליך בהקדם האפשרי.
                </Alert>
              )}
              {!!submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {submitError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="שם מלא"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="אימייל"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="טלפון"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="שם העסק"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="הודעה"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  endIcon={<SendIcon />}
                  disabled={submitting}
                  sx={{ width: '100%' }}
                >
                  {submitting ? 'שולח...' : 'שלחו הודעה'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                פרטי התקשרות
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                ניתן ליצור איתנו קשר גם בדרכים הבאות:
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,255,153,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EmailIcon sx={{ color: '#00FF99' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      אימייל
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,255,153,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon sx={{ color: '#00FF99' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      טלפון
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {phone}
                    </Typography>
                  </Box>
                </Box>

                {whatsapp ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0,255,153,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <WhatsAppIcon sx={{ color: '#00FF99' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ווצאפ
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {whatsapp}
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0,255,153,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationOnIcon sx={{ color: '#00FF99' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      כתובת
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {address}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 6,
                  p: 4,
                  bgcolor: '#262626',
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  שעות פעילות
                </Typography>
                <Typography variant="body1" paragraph>
                  ראשון - חמישי: 9:00 - 18:00
                </Typography>
                <Typography variant="body1">
                  שישי: 9:00 - 13:00
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Contact;
