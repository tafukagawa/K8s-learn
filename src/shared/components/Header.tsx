import { AppBar, Toolbar, Typography, Tabs, Tab, InputBase, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { Category } from '../../../types'

interface HeaderProps {
  categories: Category[]
  selectedCategoryId: number | null
  onCategoryChange: (id: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function Header({ categories, selectedCategoryId, onCategoryChange, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <AppBar position="sticky" sx={{ bgcolor: '#1c1d1f', zIndex: 1200 }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>
          ☸ k8s Learn
        </Typography>
        <Tabs
          value={selectedCategoryId}
          onChange={(_, v) => onCategoryChange(v)}
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: '#a435f0' } }}
          sx={{ flex: 1 }}
        >
          {categories.map(cat => (
            <Tab key={cat.id} value={cat.id} label={cat.name} sx={{ color: selectedCategoryId === cat.id ? '#a435f0' : '#9ea7ad', fontSize: 13 }} />
          ))}
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#2a2b2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1, px: 1.5, py: 0.5 }}>
          <SearchIcon sx={{ color: '#9ea7ad', fontSize: 16, mr: 0.5 }} />
          <InputBase
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="検索..."
            sx={{ color: '#f7f8fa', fontSize: 13, width: 180 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
