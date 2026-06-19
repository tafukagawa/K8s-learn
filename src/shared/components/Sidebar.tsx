import { Box, List, ListItemButton, ListItemText, Typography, LinearProgress } from '@mui/material'

export type AppMode = 'reference' | 'flashcard' | 'roadmap'
export type AppSection = 'commands' | 'knowledge'

interface SidebarProps {
  mode: AppMode
  section: AppSection
  onModeChange: (mode: AppMode) => void
  onSectionChange: (section: AppSection) => void
  doneCount: number
  totalCount: number
}

const MODES: { key: AppMode; label: string }[] = [
  { key: 'reference', label: '📖 リファレンス' },
  { key: 'flashcard', label: '🃏 フラッシュカード' },
  { key: 'roadmap', label: '🗺 ロードマップ' },
]

const SECTIONS: { key: AppSection; label: string }[] = [
  { key: 'commands', label: '⌨ Commands' },
  { key: 'knowledge', label: '📚 Knowledge' },
]

export function Sidebar({ mode, section, onModeChange, onSectionChange, doneCount, totalCount }: SidebarProps) {
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <Box sx={{ width: 200, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', p: 2, flexShrink: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
        学習モード
      </Typography>
      <List dense disablePadding>
        {MODES.map(m => (
          <ListItemButton
            key={m.key}
            selected={mode === m.key}
            onClick={() => onModeChange(m.key)}
            sx={{ borderRadius: 1, mb: 0.5, borderLeft: mode === m.key ? '3px solid' : '3px solid transparent', borderColor: mode === m.key ? 'primary.main' : 'transparent', bgcolor: mode === m.key ? 'primary.main' + '10' : undefined }}
          >
            <ListItemText primary={m.label} primaryTypographyProps={{ fontSize: 12 }} />
          </ListItemButton>
        ))}
      </List>

      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mt: 2.5, mb: 1, display: 'block' }}>
        セクション
      </Typography>
      <List dense disablePadding>
        {SECTIONS.map(s => (
          <ListItemButton
            key={s.key}
            selected={section === s.key}
            onClick={() => onSectionChange(s.key)}
            sx={{ borderRadius: 1, mb: 0.5, bgcolor: section === s.key ? '#f1f5f9' : undefined }}
          >
            <ListItemText primary={s.label} primaryTypographyProps={{ fontSize: 12, fontWeight: section === s.key ? 600 : 400 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 3, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}>学習進捗</Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, mb: 0.5 }} />
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {doneCount} / {totalCount} 完了
        </Typography>
      </Box>
    </Box>
  )
}
