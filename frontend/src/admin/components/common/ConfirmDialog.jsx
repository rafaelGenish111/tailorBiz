import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'אישור פעולה',
  content = 'האם אתה בטוח?',
  confirmText = 'אישור',
  cancelText = 'ביטול',
  confirmColor = 'primary',
}) {
  return (
    <Dialog open={open} onClose={onClose} dir="rtl">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;

