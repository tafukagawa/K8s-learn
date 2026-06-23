import { Card, CardActionArea, CardContent, Box, Typography, Chip, IconButton } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckIcon from '@mui/icons-material/Check'
import { alpha } from '@mui/material/styles'
import type { KnowledgeWithProgress, ProgressStatus } from '../../types'

const STATUS_CONFIG: Record<ProgressStatus, { label: string; color: string; bg: string }> = {
  done: { label: '完了', color: '#20c997', bg: 'rgba(32, 201, 151, 0.16)' },
  learning: { label: '学習中', color: '#f1c232', bg: 'rgba(241, 194, 50, 0.16)' },
  unseen: { label: '未学習', color: '#a8b3c7', bg: 'rgba(148, 163, 184, 0.16)' },
}

interface KnowledgeCardProps {
  item: KnowledgeWithProgress
  onClick: () => void
  onProgressChange: (status: ProgressStatus) => void
}

export function KnowledgeCard({ item, onClick, onProgressChange }: KnowledgeCardProps) {
  const status = item.progress?.status ?? 'unseen'
  const cfg = STATUS_CONFIG[status]
  const nextStatus: ProgressStatus = status === 'unseen' ? 'learning' : status === 'learning' ? 'done' : 'unseen'

  return (
    <Card
      sx={theme => ({
        height: '100%',
        backgroundImage: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(18, 27, 45, 0.98), rgba(9, 17, 30, 0.98))'
          : undefined,
      })}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 118, p: 2 }}>
          <Box
            sx={theme => ({
              width: 56,
              height: 66,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              borderRadius: 1.2,
              background: status === 'done'
                ? 'linear-gradient(135deg, #20c997, #087f5b)'
                : status === 'learning'
                  ? 'linear-gradient(135deg, #38d9c6, #0f766e)'
                  : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              boxShadow: `0 16px 34px ${alpha(theme.palette.secondary.main, 0.16)}`,
            })}
          >
            <AutoStoriesIcon />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
              <Typography variant="body1" sx={{ fontWeight: 850, lineHeight: 1.45 }}>{item.title}</Typography>
              <Box
                component="span"
                onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
                sx={{ fontSize: 11, bgcolor: cfg.bg, color: cfg.color, px: 1, py: 0.35, borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 850 }}
              >
                {cfg.label}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {item.tags.slice(0, 4).map(tag => (
                <Chip key={tag} label={tag} size="small" sx={{ fontSize: 10, height: 22, bgcolor: 'rgba(148,163,184,0.13)' }} />
              ))}
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
            sx={{
              ml: 'auto',
              bgcolor: status === 'done' ? 'rgba(32, 201, 151, 0.14)' : 'rgba(148,163,184,0.14)',
              color: status === 'done' ? 'success.main' : 'text.primary',
              '&:hover': { bgcolor: 'rgba(56,217,198,0.18)' },
            }}
          >
            {status === 'done' ? <CheckIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
