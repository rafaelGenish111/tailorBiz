import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      // Navy/Steel - Clean Industrial
      main: '#0B1F33',
      light: '#203A55',
      dark: '#071522',
      contrastText: '#ffffff',
    },
    secondary: {
      // Copper CTA
      main: '#D38B2A',
      light: '#F0B56C',
      dark: '#9A5C12',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F7F8FA',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
    },
    success: {
      // Mint accent (optional)
      main: '#2EBE8B',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Heebo', 'Assistant', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 650,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.8,
      color: '#475569',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0,0,0,0.04)',
    '0px 4px 16px rgba(0,0,0,0.06)',
    '0px 8px 24px rgba(0,0,0,0.08)',
    '0px 12px 32px rgba(0,0,0,0.1)',
    ...Array(20).fill('0px 12px 32px rgba(0,0,0,0.1)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 700,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0px 12px 32px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
}, heIL);
