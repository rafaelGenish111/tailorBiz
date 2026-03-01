// frontend/src/components/signable-documents/SendDocumentDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon
} from '@mui/icons-material';

export default function SendDocumentDialog({ open, onClose, onSend, document, client, loading }) {
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEmail(client?.personalInfo?.email || document?.clientInfo?.email || '');
      setPhone(client?.personalInfo?.whatsappPhone || client?.personalInfo?.phone || document?.clientInfo?.phone || '');
      setSendViaEmail(true);
      setSendViaWhatsapp(false);
      setError('');
    }
  }, [open, client, document]);

  const handleSend = () => {
    const sendVia = [];
    if (sendViaEmail) sendVia.push('email');
    if (sendViaWhatsapp) sendVia.push('whatsapp');

    if (sendVia.length === 0) {
      setError('נא לבחור לפחות ערוץ שליחה אחד');
      return;
    }

    if (sendViaEmail && !email.trim()) {
      setError('נא להזין כתובת אימייל');
      return;
    }

    if (sendViaWhatsapp && !phone.trim()) {
      setError('נא להזין מספר טלפון');
      return;
    }

    setError('');
    onSend({
      sendVia,
      email: sendViaEmail ? email.trim() : undefined,
      phone: sendViaWhatsapp ? phone.trim() : undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>שליחת מסמך לחתימה</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {document && (
            <Typography variant="body2" color="text.secondary">
              מסמך: <strong>{document.title}</strong> ({document.documentNumber})
            </Typography>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>ערוץ שליחה:</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendViaEmail}
                  onChange={(e) => setSendViaEmail(e.target.checked)}
                  icon={<EmailIcon />}
                  checkedIcon={<EmailIcon color="primary" />}
                />
              }
              label="אימייל"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendViaWhatsapp}
                  onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                  icon={<WhatsAppIcon />}
                  checkedIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                />
              }
              label="WhatsApp"
            />
          </Box>

          {sendViaEmail && (
            <TextField
              label="כתובת אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              fullWidth
              size="small"
            />
          )}

          {sendViaWhatsapp && (
            <TextField
              label="מספר טלפון (WhatsApp)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              fullWidth
              size="small"
              placeholder="05xxxxxxxx"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>ביטול</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : <SendIcon />}
        >
          שלח
        </Button>
      </DialogActions>
    </Dialog>
  );
}
