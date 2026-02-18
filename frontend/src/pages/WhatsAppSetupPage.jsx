import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import api, { whatsappAPI } from '../admin/utils/api';

const WhatsAppSetupPage = () => {
  const [status, setStatus] = useState(null);
  const [qrSvg, setQrSvg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restarting, setRestarting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await api.get('/whatsapp/status');
      const data = res.data;
      if (data.success) {
        setStatus(data.data);
      }
    } catch {
      setError('שגיאה בטעינת סטטוס WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const fetchQr = async () => {
    if (!status?.needsQr) return;
    try {
      const res = await api.get('/whatsapp/qr.svg', { responseType: 'text' });
      if (res.data && typeof res.data === 'string') {
        setQrSvg(res.data);
      }
    } catch (e) {
      setQrSvg(null);
      if (e.response?.data?.message) setError(e.response.data.message);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (status?.needsQr && !status?.connected) {
      const t = setTimeout(fetchQr, 500);
      return () => clearTimeout(t);
    }
    setQrSvg(null);
  }, [status?.needsQr, status?.connected]);

  useEffect(() => {
    if (!status?.connected && status?.needsQr) {
      const interval = setInterval(() => {
        fetchStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status?.connected, status?.needsQr]);

  const handleRestart = async () => {
    setRestarting(true);
    try {
      const res = await whatsappAPI.restart(false);
      const data = res.data;
      if (data.success) {
        setStatus(null);
        setQrSvg(null);
        await fetchStatus();
      } else {
        setError(data.message || 'שגיאה באיתחול');
      }
    } catch {
      setError('שגיאה באיתחול WhatsApp');
    } finally {
      setRestarting(false);
    }
  };

  const handleResetSession = async () => {
    if (!window.confirm('איפוס החיבור ימחק את ה-session הנוכחי ויציג קוד QR חדש לסריקה. להמשיך?')) return;
    setResetting(true);
    try {
      const res = await whatsappAPI.restart(true);
      const data = res.data;
      if (data.success) {
        setStatus(null);
        setQrSvg(null);
        setError(null);
        await fetchStatus();
      } else {
        setError(data.message || 'שגיאה באיפוס');
      }
    } catch {
      setError('שגיאה באיפוס חיבור WhatsApp');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        התקנת WhatsApp
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        סריקת קוד QR לחיבור WhatsApp (אוטומציה לא רשמית)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        {status?.connected ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              מחובר
            </Typography>
            <Typography variant="body2" color="text.secondary">
              WhatsApp מחובר ועובד. הודעות יגיעו ויישלחו אוטומטית.
            </Typography>
          </>
        ) : status?.needsQr ? (
          <>
            <QrCodeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              סרוק את הקוד
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              פתח WhatsApp בטלפון, עבור להגדרות → התקנות מחוברות → סרוק קוד
            </Typography>
            {qrSvg ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  display: 'inline-block',
                  '& svg': { display: 'block' },
                }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                ממתין ליצירת קוד... (בדוק גם את הטרמינל)
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            לא ניתן לקבל סטטוס. ייתכן ש-WhatsApp עדיין מאתחל. בדוק את לוג השרת.
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={async () => {
            setLoading(true);
            await fetchStatus();
          }}
          disabled={loading}
        >
          רענן
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleRestart}
          disabled={restarting || resetting || status?.connected}
        >
          {restarting ? <CircularProgress size={24} /> : 'אתחל שוב'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={resetting ? <CircularProgress size={20} /> : <ResetIcon />}
          onClick={handleResetSession}
          disabled={restarting || resetting || status?.connected}
        >
          {resetting ? 'מאפס...' : 'איפוס חיבור + QR חדש'}
        </Button>
      </Box>
    </Box>
  );
};

export default WhatsAppSetupPage;
