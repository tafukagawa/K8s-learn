import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'
  const primary = '#3B82F6'
  const secondary = '#38BDF8'

  return createTheme({
    palette: {
      mode,
      primary: { main: primary, light: '#60A5FA', dark: '#1D4ED8' },
      secondary: { main: secondary, light: '#7DD3FC', dark: '#0284C7' },
      background: {
        default: isDark ? '#141414' : '#F5F7FA',
        paper: isDark ? '#1C1C1C' : '#ffffff',
      },
      text: {
        primary: isDark ? '#E8EAF0' : '#1E3658',
        secondary: isDark ? '#8A93A8' : '#4B6A8E',
      },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : '#D0D9E8',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      h5: { letterSpacing: 0, fontWeight: 800 },
      h6: { letterSpacing: 0, fontWeight: 800 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#141414' : '#F5F7FA',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1C1C1C' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D0D9E8'}`,
            boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:hover': {
              borderColor: isDark ? 'rgba(255,255,255,0.16)' : alpha(primary, 0.4),
              boxShadow: isDark ? 'none' : `0 4px 16px ${alpha(primary, 0.10)}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 6,
            boxShadow: 'none',
            '&.MuiButton-containedPrimary': {
              background: primary,
              border: `1px solid ${alpha(primary, 0.6)}`,
              '&:hover': {
                background: '#2563EB',
                boxShadow: 'none',
              },
            },
            '&.MuiButton-outlinedPrimary': {
              borderColor: primary,
              borderWidth: '1.5px',
              '&:hover': { borderWidth: '1.5px', bgcolor: alpha(primary, 0.08) },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1C1C1C' : undefined,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#D0D9E8'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 999,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
    },
  })
}
