import { AppBar, Toolbar, Typography, Tabs, Tab, InputBase, Box, IconButton, Tooltip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import HubIcon from '@mui/icons-material/Hub'
import { alpha } from '@mui/material/styles'
import type { Category } from '../../types'

interface HeaderProps {
  categories: Category[]
  selectedCategoryId: number | null
  onCategoryChange: (id: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  darkMode: boolean
  onToggleDark: () => void
}

export function Header({ categories, selectedCategoryId, onCategoryChange, searchQuery, onSearchChange, darkMode, onToggleDark }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={theme => ({
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(7, 11, 20, 0.88)' : 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1200,
      })}
    >
      <Toolbar sx={{ gap: 2, minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 210 }}>
          <Box
            sx={theme => ({
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #8b3dff, #5b21b6)',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.light, 0.38),
              borderRadius: 1.2,
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
            })}
          >
            <HubIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 850, whiteSpace: 'nowrap' }}>
            k8s Learn
          </Typography>
        </Box>
        <Tabs
          value={selectedCategoryId}
          onChange={(_, v) => onCategoryChange(v)}
          textColor="inherit"
          slotProps={{ indicator: { style: { backgroundColor: '#8b3dff' } } }}
          sx={{ flex: 1, minHeight: 44, '& .MuiTabs-indicator': { height: 3, borderRadius: 999 } }}
        >
          {categories.map(cat => (
            <Tab key={cat.id} value={cat.id} label={cat.name} sx={{ color: selectedCategoryId === cat.id ? 'primary.light' : 'text.secondary', fontSize: 13, fontWeight: 700, minHeight: 44 }} />
          ))}
        </Tabs>
        <Box
          sx={theme => ({
            display: 'flex',
            alignItems: 'center',
            width: 340,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 38, 0.92)' : '#ffffff',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.18)' : 'divider',
            borderRadius: 1.5,
            px: 1.5,
            py: 0.75,
            boxShadow: theme.palette.mode === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 8px 24px rgba(36,51,83,0.08)',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
            },
          })}
        >
          <SearchIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 0.75 }} />
          <InputBase
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="検索（コマンド名・説明）"
            sx={{ color: 'text.primary', fontSize: 13, flex: 1 }}
          />
          <Box sx={{ color: 'text.secondary', fontSize: 11, border: '1px solid', borderColor: 'divider', borderRadius: 0.8, px: 0.75, py: 0.1 }}>
            ⌘K
          </Box>
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
