import { useEffect, useState } from 'react'
import { Box, Typography, LinearProgress, Grid, Button } from '@mui/material'
import { alpha } from '@mui/material/styles'
import RouteIcon from '@mui/icons-material/Route'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { api } from '../../shared/ipc'
import type { Category } from '../../types'

interface CategoryProgress {
  done: number
  total: number
}

export function RoadmapView({ categories, onSelectCategory }: { categories: Category[]; onSelectCategory?: (categoryId: number) => void }) {
  const [progressMap, setProgressMap] = useState<Record<number, CategoryProgress>>({})

  useEffect(() => {
    categories.forEach(cat => {
      Promise.all([api.commands.list(cat.id), api.knowledge.list(cat.id)]).then(([cmds, kn]) => {
        const all = [...cmds, ...kn]
        setProgressMap(prev => ({
          ...prev,
          [cat.id]: {
            done: all.filter(i => i.progress?.status === 'done').length,
            total: all.length,
          },
        }))
      })
    })
  }, [categories])

  const totalDone = Object.values(progressMap).reduce((s, p) => s + p.done, 0)
  const totalItems = Object.values(progressMap).reduce((s, p) => s + p.total, 0)
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <RouteIcon sx={{ color: 'primary.light' }} />
        <Typography variant="h5" sx={{ fontWeight: 850 }}>ロードマップ</Typography>
      </Box>

      {/* 全体進捗 */}
      <Box sx={theme => ({
        p: 3, mb: 3, borderRadius: 2, border: '1px solid',
        borderColor: alpha(theme.palette.primary.light, 0.3),
        bgcolor: theme.palette.mode === 'dark' ? '#1E2030' : '#F0F4FF',
        display: 'flex', alignItems: 'center', gap: 3,
      })}>
        <Box sx={theme => ({
          width: 88, height: 88, display: 'grid', placeItems: 'center', borderRadius: '50%',
          background: `conic-gradient(${theme.palette.primary.main} ${overallPct}%, rgba(148,163,184,0.14) 0)`,
          position: 'relative', flexShrink: 0,
          '&::after': { content: '""', position: 'absolute', inset: 10, borderRadius: '50%', bgcolor: theme.palette.mode === 'dark' ? '#1E2030' : '#F0F4FF' },
        })}>
          <Box sx={{ position: 'relative', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{overallPct}</Typography>
            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>%</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 850, mb: 0.5 }}>全体の学習進捗</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {totalItems} アイテム中 {totalDone} 完了
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overallPct}
            sx={{ height: 6, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
          />
        </Box>
      </Box>

      {/* カテゴリ別進捗 */}
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1.5 }}>
        カテゴリ別
      </Typography>
      <Grid container spacing={2}>
        {categories.map(cat => {
          const p = progressMap[cat.id]
          const pct = p && p.total > 0 ? Math.round((p.done / p.total) * 100) : 0
          return (
            <Grid key={cat.id} size={{ xs: 12, sm: 6 }}>
              <Box sx={theme => ({
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper',
              })}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{cat.name}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 900, color: pct === 100 ? 'success.main' : 'text.secondary' }}>
                    {pct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color={pct === 100 ? 'success' : 'primary'}
                  sx={{ height: 5, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', mb: 0.75, '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {p ? `${p.done} / ${p.total} アイテム` : '読み込み中...'}
                  </Typography>
                  {onSelectCategory && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                      onClick={() => onSelectCategory(cat.id)}
                      sx={{ fontSize: 12, py: 0.25, minWidth: 0 }}
                    >
                      リファレンス
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
