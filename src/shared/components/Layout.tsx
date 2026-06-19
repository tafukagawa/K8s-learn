import { Box } from '@mui/material'
import type { ReactNode } from 'react'

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
}

export function Layout({ header, sidebar, children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {header}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebar}
        <Box component="main" sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
