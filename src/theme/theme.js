import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // כחול נייבי כהה ומקצועי
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00bcd4', // טורקיז בהיר ונקי
      light: '#62efff',
      dark: '#008ba3',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
    },
  },
  typography: {
    fontFamily: "'Heebo', 'Assistant', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 700,
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
      color: '#616161',
    },
    button: {
      fontWeight: 600,
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
          fontWeight: 600,
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
