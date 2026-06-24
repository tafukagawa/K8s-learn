import { AppBar, Toolbar, Typography, InputBase, Box, IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MarkGithubIcon, SearchIcon, BellIcon, MoonIcon, SunIcon } from '@primer/octicons-react'

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
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 56 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          <Box sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            <MarkGithubIcon size={24} />
          </Box>
          <Typography sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 14 }}>
            k8s Learn
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={theme => ({
          display: 'flex', alignItems: 'center', width: 280,
          bgcolor: 'background.default',
          border: '1px solid', borderColor: 'divider',
          borderRadius: 1, px: 1.5, py: 0.625,
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        })}>
          <Box sx={{ color: 'text.secondary', display: 'flex', mr: 0.75 }}>
            <SearchIcon size={14} />
          </Box>
          <InputBase
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="検索（コマンド名・説明）"
            sx={{ color: 'text.primary', fontSize: 13, flex: 1 }}
          />
          <Box sx={{
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            borderRadius: 0.5, px: 0.75, fontSize: 11, color: 'text.secondary', lineHeight: '20px',
          }}>
            /
          </Box>
        </Box>

        <Tooltip title="通知">
          <IconButton size="small" disabled sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>
              <BellIcon size={14} />
            </Box>
          </IconButton>
        </Tooltip>

        <Tooltip title={darkMode ? 'ライトモード' : 'ダークモード'}>
          <IconButton onClick={onToggleDark} size="small" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>
              {darkMode ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </Box>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
