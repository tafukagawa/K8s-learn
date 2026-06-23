import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Grid, Chip, LinearProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FilterListIcon from '@mui/icons-material/FilterList'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BoltIcon from '@mui/icons-material/Bolt'
import { alpha, type Theme } from '@mui/material/styles'
import { KnowledgeCard } from './KnowledgeCard'
import { KnowledgeDetail } from './KnowledgeDetail'
import { KnowledgeForm } from './KnowledgeForm'
import { TagFilter } from './TagFilter'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress, ProgressStatus } from '../../types'

interface KnowledgeListProps {
  categoryId: number
  searchQuery: string
  onStartLearning: () => void
}

export function KnowledgeList({ categoryId, searchQuery, onStartLearning }: KnowledgeListProps) {
  const [items, setItems] = useState<KnowledgeWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<KnowledgeWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeWithProgress | null>(null)

  useEffect(() => {
    api.knowledge.list(categoryId).then(setItems)
  }, [categoryId])

  const allTags = useMemo(() => {
    const tags = new Set(items.flatMap(i => i.tags))
    return [...tags].sort()
  }, [items])

  const filtered = useMemo(() => items.filter(i => {
    const matchesSearch = searchQuery === '' ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === null || i.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  }), [items, searchQuery, selectedTag])

  const doneCount = items.filter(i => i.progress?.status === 'done').length
  const learningCount = items.filter(i => i.progress?.status === 'learning').length
  const completion = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0
  const featured = items.find(i => i.progress?.status === 'learning') ?? items.find(i => i.progress?.status !== 'done') ?? items[0]

  async function handleProgressChange(item: KnowledgeWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('knowledge', item.id, status)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: updated } : i))
  }

  async function handleDelete(id: number) {
    await api.knowledge.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDetailItem(null)
  }

  function handleFormSuccess(updatedItem: KnowledgeWithProgress) {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
    } else {
      setItems(prev => [...prev, updatedItem])
    }
    setFormOpen(false)
    setEditingItem(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 850 }}>Kubernetes Knowledge</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {items.length} 件中 {doneCount} 完了
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingItem(null); setFormOpen(true) }}>
          追加
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={theme => ({
              minHeight: 240,
              p: 2.75,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.secondary.light, 0.34),
              background: theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 78% 34%, rgba(56,217,198,0.22), transparent 28%), linear-gradient(135deg, rgba(6,78,78,0.58), rgba(10,18,36,0.96) 58%, rgba(9,14,28,0.98))'
                : 'linear-gradient(135deg, #ffffff, #ecfeff)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              overflow: 'hidden',
            })}
          >
            <Box sx={{ maxWidth: 520 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.light', mb: 3 }}>
                <AutoStoriesIcon fontSize="small" />
                <Typography sx={{ fontWeight: 850 }}>今日の理解テーマ</Typography>
              </Box>
              <Chip
                label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
                size="small"
                color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
                sx={{ mb: 1.25, fontWeight: 800 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.75 }}>
                {featured?.title ?? 'ナレッジを追加してください'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2.5 }}>
                {featured ? '概念を確認して、コマンドの背景を理解する' : '学習用のナレッジがまだありません'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5, maxWidth: 360 }}>
                <LinearProgress
                  variant="determinate"
                  value={completion}
                  sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{completion}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={!featured} onClick={onStartLearning}>
                  続きから学習する
                </Button>
                <Button variant="text" endIcon={<ArrowForwardIcon />} disabled={!featured} onClick={() => featured && setDetailItem(featured)} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  詳細を見る
                </Button>
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'grid' }, placeItems: 'center', width: 160, flexShrink: 0, color: 'secondary.light', opacity: 0.72 }}>
              <AutoStoriesIcon sx={{ fontSize: 108 }} />
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, height: '100%' }}>
            <Box sx={statCardSx}>
              <BoltIcon sx={{ color: 'primary.light' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>完了率</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{completion}%</Typography>
              <LinearProgress variant="determinate" value={completion} sx={{ height: 4, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }} />
            </Box>
            <Box sx={statCardSx}>
              <CheckCircleIcon sx={{ color: 'secondary.main' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>学習中</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{learningCount} 件</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>完了まであと {Math.max(items.length - doneCount, 0)} 件</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />
        <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={() => setSelectedTag(null)} sx={{ flexShrink: 0, bgcolor: 'background.paper' }}>
          フィルター
        </Button>
      </Box>

      <Grid container spacing={1.5}>
        {filtered.map(item => (
          <Grid key={item.id} size={{ xs: 12, md: 6 }}>
            <KnowledgeCard
              item={item}
              onClick={() => setDetailItem(item)}
              onProgressChange={status => handleProgressChange(item, status)}
            />
          </Grid>
        ))}
      </Grid>

      <KnowledgeDetail
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={i => { setEditingItem(i); setDetailItem(null); setFormOpen(true) }}
        onDelete={handleDelete}
      />
      <KnowledgeForm
        open={formOpen}
        categoryId={categoryId}
        item={editingItem}
        existingTags={allTags}
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}

const statCardSx = (theme: Theme) => ({
  minHeight: 112,
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  backgroundImage: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(24, 35, 58, 0.92), rgba(8, 15, 29, 0.96))'
    : 'none',
})
