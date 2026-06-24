import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#1f6feb' : '#0969da',
        light: isDark ? '#58a6ff' : '#218bff',
        dark: isDark ? '#1158c7' : '#0550ae',
      },
      secondary: {
        main: isDark ? '#3fb950' : '#2da44e',
        light: isDark ? '#56d364' : '#4ac26b',
        dark: isDark ? '#2ea043' : '#1a7f37',
      },
      background: {
        default: isDark ? '#0d1117' : '#F5F7FA',
        paper: isDark ? '#161b22' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e6edf3' : '#1E3658',
        secondary: isDark ? '#8b949e' : '#4B6A8E',
      },
      success: { main: isDark ? '#3fb950' : '#2da44e' },
      warning: { main: '#d29922' },
      error: { main: '#f85149' },
      divider: isDark ? '#30363d' : '#d0d7de',
      action: {
        hover: isDark ? '#21262d' : 'rgba(208,215,222,0.32)',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      h5: { letterSpacing: 0, fontWeight: 600 },
      h6: { letterSpacing: 0, fontWeight: 600 },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: isDark ? '#0d1117' : '#F5F7FA' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#161b22' : '#ffffff',
            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 6,
            boxShadow: 'none',
            '&.MuiButton-containedPrimary': {
              background: isDark ? '#1f6feb' : '#0969da',
              border: `1px solid rgba(240,246,252,0.1)`,
              '&:hover': { background: isDark ? '#1158c7' : '#0550ae', boxShadow: 'none' },
            },
            '&.MuiButton-outlinedPrimary': {
              background: isDark ? '#21262d' : 'transparent',
              borderColor: isDark ? '#30363d' : '#0969da',
              color: isDark ? '#c9d1d9' : '#0969da',
              '&:hover': {
                background: isDark ? '#30363d' : alpha('#0969da', 0.08),
                borderColor: isDark ? '#30363d' : '#0969da',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 6,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#161b22' : undefined,
            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500, borderRadius: 999 } },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
    },
  })
}
