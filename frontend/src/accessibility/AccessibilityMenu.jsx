import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import ContrastIcon from '@mui/icons-material/Contrast';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const AccessibilityMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  const toggleUnderlineLinks = () => {
    setUnderlineLinks(!underlineLinks);
    document.body.classList.toggle('underline-links');
  };

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setUnderlineLinks(false);
    document.documentElement.style.fontSize = '100%';
    document.body.classList.remove('high-contrast', 'underline-links');
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-label="תפריט נגישות"
        aria-expanded={open}
        aria-controls="accessibility-menu"
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 20,
          bgcolor: 'primary.main',
          color: 'white',
          width: 56,
          height: 56,
          boxShadow: 3,
          zIndex: 1300,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <AccessibilityNewIcon />
      </IconButton>

      <Menu
        id="accessibility-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" gutterBottom>
            הגדרות נגישות
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={increaseFontSize}>
          <TextIncreaseIcon sx={{ mr: 2 }} />
          <Typography>הגדל טקסט ({fontSize}%)</Typography>
        </MenuItem>

        <MenuItem onClick={decreaseFontSize}>
          <TextDecreaseIcon sx={{ mr: 2 }} />
          <Typography>הקטן טקסט ({fontSize}%)</Typography>
        </MenuItem>

        <MenuItem onClick={toggleHighContrast}>
          <ContrastIcon sx={{ mr: 2 }} />
          <FormControlLabel
            control={<Switch checked={highContrast} />}
            label="ניגודיות גבוהה"
            sx={{ m: 0, width: '100%' }}
          />
        </MenuItem>

        <MenuItem onClick={toggleUnderlineLinks}>
          <FormControlLabel
            control={<Switch checked={underlineLinks} />}
            label="הדגש קישורים"
            sx={{ m: 0, width: '100%' }}
          />
        </MenuItem>

        <Divider />

        <MenuItem onClick={resetSettings}>
          <RestartAltIcon sx={{ mr: 2 }} />
          <Typography>אפס הגדרות</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccessibilityMenu;
