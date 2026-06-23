import { Box } from '@mui/material'
import type { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      {header}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebar}
        <Box
          component="main"
          sx={theme => ({
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            backgroundImage: theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 22% 0%, rgba(59, 130, 246, 0.10), transparent 34%), radial-gradient(circle at 90% 12%, rgba(56, 189, 248, 0.06), transparent 28%), linear-gradient(180deg, #0d1e3a 0%, #0B1628 300px)'
              : 'radial-gradient(circle at 22% 0%, rgba(59, 130, 246, 0.06), transparent 34%), linear-gradient(180deg, #f0f7ff 0%, #EEF4FF 300px)',
          })}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
