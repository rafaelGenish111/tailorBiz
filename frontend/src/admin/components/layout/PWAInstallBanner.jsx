import { Box, Button, IconButton, Typography, Slide } from '@mui/material';
import { GetApp as InstallIcon, Close as CloseIcon } from '@mui/icons-material';
import { usePWAInstall } from '../../hooks/usePWA';

function PWAInstallBanner() {
  const { canInstall, install, dismiss } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <Slide direction="up" in={canInstall} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 68, md: 16 }, // Above bottom nav on mobile
          left: 16,
          right: 16,
          maxWidth: 400,
          mx: 'auto',
          zIndex: 1400,
          bgcolor: '#232f3e',
          color: 'white',
          borderRadius: 3,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <InstallIcon sx={{ color: '#ec7211', fontSize: 32, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            התקן את TailorBiz
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            גישה מהירה מהמסך הראשי
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={install}
          sx={{
            bgcolor: '#ec7211',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#c75e0c' },
          }}
        >
          התקן
        </Button>
        <IconButton size="small" onClick={dismiss} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Slide>
  );
}

export default PWAInstallBanner;
