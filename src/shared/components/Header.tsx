import { AppBar, Toolbar, Typography, InputBase, Box, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import HubIcon from '@mui/icons-material/Hub'
import { alpha } from '@mui/material/styles'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  darkMode: boolean
  onToggleDark: () => void
}

export function Header({ searchQuery, onSearchChange, darkMode, onToggleDark }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={theme => ({
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(17,17,17,0.96)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1200,
      })}
    >
      <Toolbar sx={{ gap: 2, minHeight: 60 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 210 }}>
          <Box sx={theme => ({
            width: 34, height: 34, display: 'grid', placeItems: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            border: '1px solid', borderColor: alpha(theme.palette.primary.light, 0.38),
            borderRadius: 1.2,
          })}>
            <HubIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 850, whiteSpace: 'nowrap', fontSize: 15 }}>
            k8s Learn
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={theme => ({
          display: 'flex', alignItems: 'center', width: 320,
          bgcolor: theme.palette.mode === 'dark' ? '#222222' : '#ffffff',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'divider',
          borderRadius: 1.5, px: 1.5, py: 0.75,
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
          },
        })}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 17, mr: 0.75 }} />
          <InputBase
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="検索（コマンド名・説明）"
            sx={{ color: 'text.primary', fontSize: 13, flex: 1 }}
          />
        </Box>

        <Tooltip title="通知">
          <IconButton size="small" disabled sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={darkMode ? 'ライトモード' : 'ダークモード'}>
          <IconButton onClick={onToggleDark} size="small" sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', '&:hover': { color: 'primary.light' } }}>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
