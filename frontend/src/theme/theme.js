import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FF99',
      light: '#66FFB8',
      dark: '#00E676',
      contrastText: '#0A0A0A',
    },
    secondary: {
      main: '#00FF99',
      light: '#66FFB8',
      dark: '#00E676',
      contrastText: '#0A0A0A',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    grey: {
      50: '#262626',
      100: '#333333',
      200: '#4D4D4D',
    },
    success: {
      main: '#00FF99',
      contrastText: '#0A0A0A',
    },
  },
  typography: {
    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '4.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: '#FFFFFF',
      '@media (min-width:900px)': {
        fontSize: '5rem',
      },
      '@media (max-width:600px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: '#FFFFFF',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#FFFFFF',
    },
    h4: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h5: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#FFFFFF',
    },
    h6: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      color: '#FFFFFF',
    },
    body1: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontSize: '1.125rem',
      lineHeight: 1.8,
      color: '#B0B0B0',
      fontWeight: 400,
    },
    body2: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      color: '#B0B0B0',
      fontWeight: 400,
    },
    button: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.3)',
    '0px 4px 16px rgba(0,0,0,0.4)',
    '0px 8px 24px rgba(0,0,0,0.5)',
    '0px 20px 40px -10px rgba(0,0,0,0.6)',
    '0px 20px 40px -10px rgba(0,0,0,0.6)',
    ...Array(19).fill('0px 20px 40px -10px rgba(0,0,0,0.6)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: '#00FF99',
          color: '#0A0A0A',
          '&:hover': {
            background: '#66FFB8',
            boxShadow: '0px 8px 24px rgba(0, 255, 153, 0.3)',
            transform: 'scale(1.05)',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#333333',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#00FF99',
            backgroundColor: 'rgba(0, 255, 153, 0.08)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          backgroundColor: '#1A1A1A',
          border: '1px solid #333333',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 24px 48px -12px rgba(0, 255, 153, 0.15)',
            borderColor: '#00FF99',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#333333' },
            '&:hover fieldset': { borderColor: '#00FF99' },
            '&.Mui-focused fieldset': { borderColor: '#00FF99' },
            color: '#B0B0B0',
            backgroundColor: '#262626',
          },
          '& .MuiInputLabel-root': { color: '#9E9E9E' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#00FF99' },
        },
      },
    },
  },
}, heIL);
