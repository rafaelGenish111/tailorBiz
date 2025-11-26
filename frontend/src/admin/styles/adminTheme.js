import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#232f3e', // AWS Dark Navy
      light: '#37475a',
      dark: '#19212b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec7211', // AWS Orange
      light: '#ff9900',
      dark: '#c75e0c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f2f3f3', // AWS Light Gray Background
      paper: '#ffffff',
    },
    text: {
      primary: '#16191f',
      secondary: '#545b64',
    },
    divider: '#eaeded',
  },
  typography: {
    fontFamily: ['Rubik', 'Heebo', '-apple-system', 'BlinkMacSystemFont', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 700, fontSize: '2rem' },
    h2: { fontWeight: 700, fontSize: '1.75rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontSize: '0.9rem', color: '#545b64' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.85rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2, // Slightly rounded, but cleaner
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#ec7211', // Primary action buttons usually orange in AWS marketing/console
          '&:hover': {
            backgroundColor: '#c75e0c',
          },
        },
        containedSecondary: {
          backgroundColor: '#232f3e',
          '&:hover': {
            backgroundColor: '#19212b',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0, // AWS often uses sharp corners or very subtle rounding
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #eaeded',
        },
        rounded: {
            borderRadius: 8, // For cards inside content
        }
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#232f3e',
          color: '#ffffff',
          boxShadow: 'none',
          borderBottom: '1px solid #19212b',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // Often white with dark text, or dark with light text. Let's go dark sidebar to match header usually.
          color: '#16191f',
          borderRight: '1px solid #eaeded',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '&.Mui-selected': {
            backgroundColor: '#f2f8fd',
            color: '#232f3e',
            borderRight: '3px solid #ec7211', // AWS style active indicator
            '& .MuiListItemIcon-root': {
              color: '#ec7211',
            },
          },
          '&:hover': {
            backgroundColor: '#fafafa',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: '#545b64',
        },
      },
    },
  },
});

export default adminTheme;
