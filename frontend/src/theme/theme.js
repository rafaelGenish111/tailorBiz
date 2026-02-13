import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E676',
      light: '#00FF99',
      dark: '#00C853',
      contrastText: '#111111',
    },
    secondary: {
      main: '#00E676',
      light: '#00FF99',
      dark: '#00C853',
      contrastText: '#111111',
    },
    background: {
      default: '#111111',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    grey: {
      50: '#2A2A2A',
      100: '#333333',
      200: '#424242',
    },
    success: {
      main: '#00E676',
      contrastText: '#111111',
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
      color: '#E0E0E0',
      fontWeight: 400,
    },
    body2: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      color: '#E0E0E0',
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
          background: '#00E676',
          color: '#111111',
          '&:hover': {
            background: '#00FF99',
            boxShadow: '0px 8px 24px rgba(0, 230, 118, 0.3)',
            transform: 'scale(1.05)',
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#424242',
          color: '#FFFFFF',
          '&:hover': {
            borderColor: '#00E676',
            backgroundColor: 'rgba(0, 230, 118, 0.08)',
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
            boxShadow: '0px 24px 48px -12px rgba(0, 230, 118, 0.15)',
            borderColor: '#00E676',
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
            '& fieldset': { borderColor: '#424242' },
            '&:hover fieldset': { borderColor: '#00E676' },
            '&.Mui-focused fieldset': { borderColor: '#00E676' },
            color: '#E0E0E0',
            backgroundColor: '#1E1E1E',
          },
          '& .MuiInputLabel-root': { color: '#9E9E9E' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#00E676' },
        },
      },
    },
  },
}, heIL);
