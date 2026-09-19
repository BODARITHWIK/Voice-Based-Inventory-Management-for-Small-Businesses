import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#059669', // Emerald Green for Inventory & Growth
      light: '#34d399',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2563eb', // Royal Blue for primary actions
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Amber / Orange for warning/pending
      light: '#fef3c7',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Red for low/out of stock
      light: '#fee2e2',
      dark: '#b91c1c',
    },
    info: {
      main: '#0284c7',
      light: '#e0f2fe',
      dark: '#0369a1',
    },
    background: {
      default: '#f8fafc', // Clean modern slate background
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700, color: '#0f172a' },
    h2: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700, color: '#0f172a' },
    h3: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 700, color: '#0f172a' },
    h4: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 600, color: '#0f172a' },
    h5: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 600, color: '#0f172a' },
    h6: { fontFamily: "'Outfit', 'Inter', sans-serif", fontWeight: 600, color: '#0f172a' },
    subtitle1: { color: '#64748b' },
    subtitle2: { color: '#64748b', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '14px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#475569',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
