import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'
  const primary = isDark ? '#5590C8' : '#3B82F6'
  const primaryLight = isDark ? '#7AAED8' : '#60A5FA'
  const primaryDark = isDark ? '#2962A0' : '#1D4ED8'
  const secondary = '#38BDF8'

  return createTheme({
    palette: {
      mode,
      primary: { main: primary, light: primaryLight, dark: primaryDark },
      secondary: { main: secondary, light: '#7DD3FC', dark: '#0284C7' },
      background: {
        default: isDark ? '#0B1628' : '#EEF4FF',
        paper: isDark ? '#0F1F35' : '#ffffff',
      },
      text: {
        primary: isDark ? '#E2E8F0' : '#1E3658',
        secondary: isDark ? '#94A3B8' : '#4B6A8E',
      },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
      divider: isDark ? 'rgba(148, 163, 184, 0.14)' : '#C7D7EE',
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
            backgroundColor: isDark ? '#0B1628' : '#EEF4FF',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: isDark
              ? 'linear-gradient(135deg, rgba(15, 31, 60, 0.96), rgba(9, 18, 36, 0.96))'
              : 'linear-gradient(135deg, #ffffff, #f0f7ff)',
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.12)' : '#C7D7EE'}`,
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.28)' : '0 2px 12px rgba(15,32,86,0.08)',
            transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.12s',
            '&:hover': {
              borderColor: alpha(primary, isDark ? 0.4 : 0.3),
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.36)' : `0 4px 20px ${alpha(primary, 0.12)}`,
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 8,
            boxShadow: 'none',
            '&.MuiButton-containedPrimary': {
              background: `linear-gradient(135deg, ${primary}, #1D4ED8)`,
              '&:hover': {
                background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
                boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.40)' : `0 4px 14px ${alpha(primary, 0.22)}`,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            backgroundImage: isDark
              ? 'linear-gradient(135deg, rgba(13, 26, 55, 0.98), rgba(9, 17, 35, 0.98))'
              : undefined,
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.14)' : '#C7D7EE'}`,
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
