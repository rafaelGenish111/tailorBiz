import { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function ChatForm({ fields, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});

  const fieldLabels = {
    name: 'שם מלא',
    email: 'אימייל',
    phone: 'טלפון',
    company: 'שם החברה',
    message: 'הודעה נוספת (אופציונלי)',
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        bgcolor: '#262626',
        borderRadius: 1,
        m: 2,
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        מלא את הפרטים:
      </Typography>

      {fields.map((field) => (
        <TextField
          key={field}
          fullWidth
          label={fieldLabels[field]}
          value={formData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          required={field !== 'message'}
          multiline={field === 'message'}
          rows={field === 'message' ? 3 : 1}
          sx={{ mb: 2 }}
          size="small"
        />
      ))}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          endIcon={<SendIcon />}
          fullWidth
        >
          שלח
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          ביטול
        </Button>
      </Box>
    </Box>
  );
}

export default ChatForm;

