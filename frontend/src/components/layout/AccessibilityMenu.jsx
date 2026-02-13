import { useState, useEffect } from 'react';
import {
  Fab,
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import CloseIcon from '@mui/icons-material/Close';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import ContrastIcon from '@mui/icons-material/Contrast';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { applyAccessibility, getAccessibilitySettings } from '../../utils/accessibility';

function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getAccessibilitySettings());

  useEffect(() => {
    applyAccessibility(settings);
  }, [settings]);

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 24),
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 14),
    }));
  };

  const toggleContrast = () => {
    setSettings(prev => ({
      ...prev,
      contrast: prev.contrast === 'normal' ? 'high' : 'normal',
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 16,
      contrast: 'normal',
      highlightLinks: false,
      largeCursor: false,
    };
    setSettings(defaultSettings);
    applyAccessibility(defaultSettings);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="תפריט נגישות"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1200,
          width: 56,
          height: 56,
        }}
      >
        <AccessibilityNewIcon />
      </Fab>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 360 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              הצהרת נגישות
            </Typography>
            <IconButton onClick={() => setOpen(false)} aria-label="סגור">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* גודל טקסט */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              גודל טקסט
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={decreaseFontSize} aria-label="הקטן טקסט">
                <TextDecreaseIcon />
              </IconButton>
              <Typography>{settings.fontSize}px</Typography>
              <IconButton onClick={increaseFontSize} aria-label="הגדל טקסט">
                <TextIncreaseIcon />
              </IconButton>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* ניגודיות */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              ניגודיות
            </Typography>
            <Button
              variant={settings.contrast === 'high' ? 'contained' : 'outlined'}
              startIcon={<ContrastIcon />}
              onClick={toggleContrast}
              fullWidth
            >
              {settings.contrast === 'high' ? 'ניגודיות גבוהה פעילה' : 'הפעל ניגודיות גבוהה'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* אפשרויות נוספות */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.highlightLinks}
                  onChange={(e) => setSettings(prev => ({ ...prev, highlightLinks: e.target.checked }))}
                />
              }
              label="הדגש קישורים"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.largeCursor}
                  onChange={(e) => setSettings(prev => ({ ...prev, largeCursor: e.target.checked }))}
                />
              }
              label="סמן עכבר מוגדל"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* איפוס */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon />}
            onClick={resetSettings}
            fullWidth
          >
            אפס הגדרות
          </Button>

          <Box sx={{ mt: 4, p: 2, bgcolor: '#262626', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              האתר נבנה בהתאם לתקן הנגישות הישראלי (תקנות שוויון זכויות, התשע"ג-2013).
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default AccessibilityMenu;

