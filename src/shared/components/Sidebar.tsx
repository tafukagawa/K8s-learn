import { Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Typography, LinearProgress } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import StyleIcon from '@mui/icons-material/Style'
import RouteIcon from '@mui/icons-material/Route'
import TerminalIcon from '@mui/icons-material/Terminal'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import SettingsIcon from '@mui/icons-material/Settings'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { alpha } from '@mui/material/styles'

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

const MODES: { key: AppMode; label: string; icon: React.ReactNode }[] = [
  { key: 'reference', label: 'リファレンス', icon: <MenuBookIcon fontSize="small" /> },
  { key: 'flashcard', label: 'フラッシュカード', icon: <StyleIcon fontSize="small" /> },
  { key: 'roadmap', label: 'ロードマップ', icon: <RouteIcon fontSize="small" /> },
]

const SECTIONS: { key: AppSection; label: string; icon: React.ReactNode }[] = [
  { key: 'commands', label: 'Commands', icon: <TerminalIcon fontSize="small" /> },
  { key: 'knowledge', label: 'Knowledge', icon: <LightbulbIcon fontSize="small" /> },
]

export function Sidebar({ mode, section, onModeChange, onSectionChange, doneCount, totalCount }: SidebarProps) {
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0
  const milestones = [5, 10, 20, 30, 50, 75, 100, 150, 200]
  const nextMilestone = Math.min(milestones.find(m => m > doneCount) ?? totalCount, totalCount)
  const remaining = Math.max(0, nextMilestone - doneCount)
  const goalText = remaining > 0 ? `あと ${remaining} 個で ${nextMilestone} アイテム達成！` : '全アイテムを完了しました！'

  return (
    <Box
      sx={theme => ({
        width: 232,
        bgcolor: theme.palette.mode === 'dark' ? '#050912' : '#ffffff',
        borderRight: '1px solid',
        borderColor: 'divider',
        p: 2,
        flexShrink: 0,
        overflowY: 'auto',
        backgroundImage: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, rgba(59, 130, 246, 0.06), transparent 240px)'
          : undefined,
      })}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block', fontWeight: 800 }}>
            学習モード
          </Typography>
          <List dense disablePadding>
            {MODES.map(m => (
              <ListItemButton
                key={m.key}
                selected={mode === m.key}
                onClick={() => onModeChange(m.key)}
                sx={theme => ({
                  borderRadius: 1,
                  mb: 0.65,
                  minHeight: 48,
                  border: '1px solid transparent',
                  bgcolor: mode === m.key ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1) : undefined,
                  backgroundImage: mode === m.key ? 'linear-gradient(135deg, rgba(59,130,246,0.24), rgba(59,130,246,0.08))' : undefined,
                  borderColor: mode === m.key ? alpha(theme.palette.primary.light, 0.28) : 'transparent',
                  '&.Mui-selected:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.22),
                  },
                })}
              >
                <ListItemIcon sx={{ minWidth: 34, color: mode === m.key ? 'primary.light' : 'text.secondary' }}>
                  {m.icon}
                </ListItemIcon>
                <ListItemText primary={m.label} slotProps={{ primary: { sx: { fontSize: 13, fontWeight: mode === m.key ? 800 : 600 } } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block', fontWeight: 800 }}>
            セクション
          </Typography>
          <List dense disablePadding>
            {SECTIONS.map(s => (
              <ListItemButton
                key={s.key}
                selected={section === s.key}
                onClick={() => onSectionChange(s.key)}
                sx={theme => ({
                  borderRadius: 1,
                  mb: 0.65,
                  minHeight: 44,
                  border: '1px solid transparent',
                  bgcolor: section === s.key ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08) : undefined,
                  borderColor: section === s.key ? alpha(theme.palette.primary.light, 0.22) : 'transparent',
                })}
              >
                <ListItemIcon sx={{ minWidth: 34, color: section === s.key ? 'primary.light' : 'text.secondary' }}>
                  {s.icon}
                </ListItemIcon>
                <ListItemText primary={s.label} slotProps={{ primary: { sx: { fontSize: 13, fontWeight: section === s.key ? 800 : 600 } } }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box
          sx={theme => ({
            p: 1.5,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 38, 0.78)' : '#f8fbff',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          })}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.25, fontWeight: 800 }}>学習進捗</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box
              sx={theme => ({
                width: 82,
                height: 82,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                background: `conic-gradient(${theme.palette.primary.main} ${progress}%, rgba(148,163,184,0.14) 0)`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 9,
                  borderRadius: '50%',
                  bgcolor: theme.palette.mode === 'dark' ? '#08101f' : '#ffffff',
                },
              })}
            >
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{doneCount}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>/ {totalCount}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>完了</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{Math.round(progress)}% 到達</Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 7, borderRadius: 1, bgcolor: 'rgba(148,163,184,0.16)', '& .MuiLinearProgress-bar': { borderRadius: 1 } }} />
        </Box>

        <Box
          sx={theme => ({
            p: 1.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.light, 0.24),
            background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(37,99,235,0.08))',
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EmojiEventsIcon fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>次の目標</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
            {goalText}
          </Typography>
          <Button fullWidth size="small" variant="contained" endIcon={<ArrowForwardIcon fontSize="small" />} disabled>
            目標を見る
          </Button>
        </Box>

        <Button startIcon={<SettingsIcon fontSize="small" />} size="small" sx={{ justifyContent: 'flex-start', color: 'text.secondary', mt: 'auto' }} disabled>
          設定
        </Button>
      </Box>
    </Box>
  )
}
