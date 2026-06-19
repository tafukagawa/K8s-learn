import { Card, CardActionArea, CardContent, Box, Typography, Chip } from '@mui/material'
import type { KnowledgeWithProgress, ProgressStatus } from '../../types'

const STATUS_CONFIG: Record<ProgressStatus, { label: string; color: string; bg: string }> = {
  done:     { label: '✓ 完了', color: '#059669', bg: '#dcfce7' },
  learning: { label: '学習中', color: '#854d0e', bg: '#fef9c3' },
  unseen:   { label: '未学習', color: '#64748b', bg: '#f1f5f9' },
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
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.title}</Typography>
            <Box
              component="span"
              onClick={e => { e.stopPropagation(); onProgressChange(nextStatus) }}
              sx={{ fontSize: 10, bgcolor: cfg.bg, color: cfg.color, px: 1, py: 0.25, borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap', ml: 1 }}
            >
              {cfg.label}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {item.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
