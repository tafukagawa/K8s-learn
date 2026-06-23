import { Card, CardContent, CardActionArea, Box, Typography, Chip, IconButton } from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckIcon from '@mui/icons-material/Check'
import type { CommandWithProgress, ProgressStatus } from '../../types'

const STATUS_CONFIG: Record<ProgressStatus, { label: string; color: string; bg: string }> = {
  done: { label: '完了', color: '#20c997', bg: 'rgba(32, 201, 151, 0.16)' },
  learning: { label: '学習中', color: '#f1c232', bg: 'rgba(241, 194, 50, 0.16)' },
  unseen: { label: '未学習', color: '#a8b3c7', bg: 'rgba(148, 163, 184, 0.16)' },
}

interface CommandCardProps {
  command: CommandWithProgress
  onClick: () => void
  onProgressChange: (status: ProgressStatus) => void
}

export function CommandCard({ command, onClick, onProgressChange }: CommandCardProps) {
  const status = command.progress?.status ?? 'unseen'
  const cfg = STATUS_CONFIG[status]
  const nextStatus: ProgressStatus = status === 'unseen' ? 'learning' : status === 'learning' ? 'done' : 'unseen'

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 132, p: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 72,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              borderRadius: 1.2,
              background: status === 'done'
                ? 'linear-gradient(135deg, #20c997, #087f5b)'
                : status === 'learning'
                  ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                  : 'linear-gradient(135deg, #1971c2, #0b3d91)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.32)',
            }}
          >
            <TerminalIcon />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontFamily: 'monospace', fontSize: 18, color: 'text.primary', fontWeight: 850, overflowWrap: 'anywhere' }}>
                {command.name}
              </Typography>
              <Box
                component="span"
                onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
                sx={{ fontSize: 11, bgcolor: cfg.bg, color: cfg.color, px: 1, py: 0.35, borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 850 }}
              >
                {cfg.label}
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.2 }}>
              {command.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
                {command.tags.slice(0, 3).map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ fontSize: 10, height: 22, bgcolor: 'rgba(148,163,184,0.13)' }} />
                ))}
              </Box>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
            sx={{
              ml: 'auto',
              bgcolor: status === 'done' ? 'rgba(32, 201, 151, 0.14)' : 'rgba(148,163,184,0.14)',
              color: status === 'done' ? 'success.main' : 'text.primary',
              '&:hover': { bgcolor: 'rgba(59,130,246,0.18)' },
            }}
          >
            {status === 'done' ? <CheckIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
