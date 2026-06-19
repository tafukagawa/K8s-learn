import { Card, CardContent, CardActionArea, Box, Typography, Chip } from '@mui/material'
import type { CommandWithProgress, ProgressStatus } from '../../types'

const STATUS_CONFIG: Record<ProgressStatus, { label: string; color: string; bg: string }> = {
  done:     { label: '✓ 完了', color: '#059669', bg: '#dcfce7' },
  learning: { label: '学習中', color: '#854d0e', bg: '#fef9c3' },
  unseen:   { label: '未学習', color: '#64748b', bg: '#f1f5f9' },
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
    <Card>
      <CardActionArea onClick={onClick} sx={{ p: 0 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: 'primary.main', fontWeight: 600, bgcolor: '#a435f008', px: 1, py: 0.5, borderRadius: 0.5 }}>
              {command.name}
            </Typography>
            <Box
              component="span"
              onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
              sx={{ fontSize: 10, bgcolor: cfg.bg, color: cfg.color, px: 1, py: 0.25, borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', ml: 1 }}
            >
              {cfg.label}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.primary', mb: 1 }}>
            {command.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {command.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
