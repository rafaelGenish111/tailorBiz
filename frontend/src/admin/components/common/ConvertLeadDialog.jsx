import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert,
} from '@mui/material';

const ConvertLeadDialog = ({ open, onClose, onConfirm, clientName, isPending }) => {
  const [finalPrice, setFinalPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    const formData = new FormData();
    if (finalPrice) formData.append('finalPrice', finalPrice);
    if (notes) formData.append('notes', notes);
    onConfirm(formData);
  };

  const handleClose = () => {
    setFinalPrice('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>סגירת עסקה - המרה ללקוח</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          {clientName ? `הליד "${clientName}" יומר ללקוח פעיל.` : 'הליד יומר ללקוח פעיל.'}
          {' '}פרויקט ייווצר אוטומטית אם לא קיים.
        </Alert>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="מחיר סופי (₪)"
            type="number"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <TextField
            label="הערות"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>ביטול</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? 'ממיר...' : 'סגור עסקה'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertLeadDialog;
