// frontend/src/components/leads/QuickAddLead.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Chip,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import {
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCreateClient } from '../../admin/hooks/useClients';

const QuickAddLead = ({ open, onClose, preSelectedSource = 'whatsapp' }) => {
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    businessName: '',
    leadSource: preSelectedSource,
    initialMessage: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Reset when dialog opens with new source
  React.useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        leadSource: preSelectedSource
      }));
    }
  }, [open, preSelectedSource]);

  const leadSources = [
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366' },
    { value: 'phone', label: 'טלפון', icon: '📞', color: '#2196f3' },
    { value: 'website_form', label: 'טופס אתר', icon: '🌐', color: '#9c27b0' },
    { value: 'referral', label: 'המלצה', icon: '👥', color: '#ff9800' },
    { value: 'facebook', label: 'Facebook', icon: '👍', color: '#1877f2' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0077b5' },
    { value: 'other', label: 'אחר', icon: '📋', color: '#607d8b' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // נקה שגיאה אם יש
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'שם חובה';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'טלפון חובה';
    } else if (!/^0\d{1,2}-?\d{7}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'מספר טלפון לא תקין';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const clientData = {
        personalInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          whatsappPhone: formData.leadSource === 'whatsapp' ? formData.phone : '',
          preferredContactMethod: formData.leadSource === 'whatsapp' ? 'whatsapp' :
            formData.leadSource === 'phone' ? 'phone' : 'email'
        },
        businessInfo: {
          businessName: formData.businessName || 'לא צוין'
        },
        leadSource: formData.leadSource,
        status: 'new_lead',
        tags: ['ליד חדש', formData.leadSource],
        interactions: formData.initialMessage ? [{
          type: formData.leadSource === 'whatsapp' ? 'whatsapp' : 'note',
          direction: 'inbound',
          subject: 'הודעה ראשונה',
          content: formData.initialMessage,
          timestamp: new Date()
        }] : [],
        metadata: {
          notes: formData.notes
        }
      };

      await createClient.mutateAsync(clientData);

      // איפוס הטופס
      setFormData({
        fullName: '',
        phone: '',
        businessName: '',
        leadSource: 'whatsapp',
        initialMessage: '',
        notes: ''
      });

      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const selectedSource = leadSources.find(s => s.value === formData.leadSource);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">⚡ ליד חדש - הזנה מהירה</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* מקור הליד */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              מקור הליד
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {leadSources.map((source) => (
                <Chip
                  key={source.value}
                  label={`${source.icon} ${source.label}`}
                  onClick={() => handleChange('leadSource', source.value)}
                  variant={formData.leadSource === source.value ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: formData.leadSource === source.value ? source.color : 'transparent',
                    color: formData.leadSource === source.value ? 'white' : 'inherit',
                    borderColor: source.color,
                    '&:hover': {
                      bgcolor: formData.leadSource === source.value ? source.color : 'action.hover'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* שם מלא */}
          <TextField
            label="שם מלא *"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={!!errors.fullName}
            helperText={errors.fullName}
            fullWidth
            autoFocus
          />

          {/* טלפון */}
          <TextField
            label="טלפון / WhatsApp *"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone || 'לדוגמה: 050-1234567'}
            placeholder="050-1234567"
            fullWidth
            InputProps={{
              startAdornment: formData.leadSource === 'whatsapp' ?
                <WhatsAppIcon sx={{ color: '#25D366', mr: 1 }} /> :
                <PhoneIcon sx={{ color: 'primary.main', mr: 1 }} />
            }}
          />

          {/* שם עסק */}
          <TextField
            label="שם העסק"
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="אופציונלי"
            fullWidth
          />

          {/* הודעה ראשונה */}
          <TextField
            label="מה הוא כתב/אמר?"
            value={formData.initialMessage}
            onChange={(e) => handleChange('initialMessage', e.target.value)}
            placeholder='לדוגמה: "היי, אני מעוניין לשמוע על המערכת שלכם"'
            multiline
            rows={3}
            fullWidth
          />

          {/* הערות */}
          <TextField
            label="הערות נוספות"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="כל מידע נוסף שחשוב לזכור"
            multiline
            rows={2}
            fullWidth
          />

          {/* Alert מידע */}
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              💡 <strong>מה יקרה אחרי?</strong>
              <br />
              • הליד ייכנס למערכת עם ציון אוטומטי
              <br />
              • תקבל תזכורת לטפל בו תוך 24 שעות
              <br />
              • אם לא תהיה התקדמות, נשלח follow-up אוטומטי
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>ביטול</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createClient.isPending}
        >
          {createClient.isPending ? 'שומר...' : '✨ צור ליד'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddLead;

