import { createTheme } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light', // Light Mode - Premium Apple Aesthetic
    primary: {
      // Electric Blue / Deep Royal Blue
      main: '#0071E3',
      light: '#0077ED',
      dark: '#0066CC',
      contrastText: '#ffffff',
    },
    secondary: {
      // Alternative accent
      main: '#0071E3',
      light: '#0077ED',
      dark: '#0066CC',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFFFFF', // Pure white base
      paper: '#F5F5F7', // Very light gray/off-white for sections
    },
    text: {
      primary: '#1D1D1F', // Deep charcoal gray for headings
      secondary: '#86868B', // Medium gray for body text
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
    fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '4.5rem', // text-5xl equivalent
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: '#1D1D1F',
      '@media (min-width:900px)': {
        fontSize: '5rem', // text-7xl equivalent for md and up
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
      color: '#1D1D1F',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#1D1D1F',
    },
    h4: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      color: '#1D1D1F',
    },
    h5: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#1D1D1F',
    },
    h6: {
      fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
      fontWeight: 700,
      color: '#1D1D1F',
    },
    body1: {
      fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
      fontSize: '1.125rem',
      lineHeight: 1.8,
      color: '#86868B',
      fontWeight: 400,
    },
    body2: {
      fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
      color: '#86868B',
      fontWeight: 400,
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
    '0px 20px 40px -10px rgba(0,0,0,0.05)', // Super soft shadow for cards
    '0px 20px 40px -10px rgba(0,0,0,0.05)',
    ...Array(19).fill('0px 20px 40px -10px rgba(0,0,0,0.05)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // rounded-full (pill shape)
          padding: '12px 32px', // px-8 py-3 equivalent - "High Ticket" look
          fontSize: '1rem',
          fontWeight: 500, // font-medium
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease', // transition-all duration-300
          fontFamily: "'Assistant', system-ui, -apple-system, sans-serif",
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          background: '#0071E3', // Royal Blue
          color: '#ffffff',
          '&:hover': {
            background: '#0077ED', // hover:bg-[#0077ED]
            boxShadow: '0px 8px 24px rgba(0, 113, 227, 0.3)', // hover:shadow-lg
            transform: 'scale(1.05)', // hover:scale-105
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: '#D1D1D6', // border border-gray-300
          color: '#1D1D1F', // text-[#1D1D1F]
          '&:hover': {
            borderColor: '#1D1D1F', // hover:border-gray-800
            backgroundColor: 'rgba(29, 29, 31, 0.05)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // rounded-3xl
          boxShadow: '0px 20px 40px -10px rgba(0,0,0,0.05)', // Super soft shadow
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 24px 48px -12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
  },
}, heIL);
