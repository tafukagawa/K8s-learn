import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#a435f0' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    success: { main: '#059669' },
    warning: { main: '#854d0e' },
    error: { main: '#dc2626' },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          fontWeight: 600,
        },
      },
    },
  },
})
