import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'
  const primary = '#8b3dff'
  const secondary = '#38d9c6'

  return createTheme({
    palette: {
      mode,
      primary: { main: primary, light: '#b478ff', dark: '#6420d7' },
      secondary: { main: secondary, light: '#73f5e8', dark: '#139c92' },
      background: {
        default: isDark ? '#070b14' : '#eef3fb',
        paper: isDark ? '#0f1726' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f6f7fb' : '#172033',
        secondary: isDark ? '#9aa8bf' : '#5f6d83',
      },
      success: { main: '#20c997' },
      warning: { main: '#f1c232' },
      error: { main: '#ef476f' },
      divider: isDark ? 'rgba(148, 163, 184, 0.18)' : '#dbe3ef',
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
            backgroundColor: isDark ? '#070b14' : '#eef3fb',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: isDark
              ? 'linear-gradient(135deg, rgba(18, 27, 45, 0.96), rgba(9, 17, 30, 0.96))'
              : 'linear-gradient(135deg, #ffffff, #f8fbff)',
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.16)' : '#dbe3ef'}`,
            boxShadow: isDark ? '0 18px 50px rgba(0,0,0,0.24)' : '0 14px 38px rgba(36,51,83,0.1)',
            transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.12s',
            '&:hover': {
              borderColor: alpha(primary, isDark ? 0.5 : 0.28),
              boxShadow: isDark ? `0 22px 60px ${alpha(primary, 0.16)}` : '0 18px 46px rgba(36,51,83,0.14)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 8,
            boxShadow: 'none',
            '&.MuiButton-containedPrimary': {
              background: `linear-gradient(135deg, ${primary}, #6d28d9)`,
              '&:hover': {
                background: 'linear-gradient(135deg, #9d5cff, #7c3aed)',
                boxShadow: `0 12px 28px ${alpha(primary, 0.34)}`,
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
              ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(8, 13, 24, 0.98))'
              : undefined,
            border: `1px solid ${isDark ? 'rgba(148, 163, 184, 0.18)' : '#dbe3ef'}`,
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
