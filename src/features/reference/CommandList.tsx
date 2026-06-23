import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Grid, Chip, LinearProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FilterListIcon from '@mui/icons-material/FilterList'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BoltIcon from '@mui/icons-material/Bolt'
import { alpha } from '@mui/material/styles'
import { CommandCard } from './CommandCard'
import { TagFilter } from './TagFilter'
import { CommandDetail } from './CommandDetail'
import { CommandForm } from './CommandForm'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, ProgressStatus } from '../../types'

interface CommandListProps {
  categoryId: number
  searchQuery: string
  onStartLearning: () => void
}

export function CommandList({ categoryId, searchQuery, onStartLearning }: CommandListProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailCommand, setDetailCommand] = useState<CommandWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<CommandWithProgress | null>(null)

  useEffect(() => {
    api.commands.list(categoryId).then(setCommands)
  }, [categoryId])

  const allTags = useMemo(() => {
    const tags = new Set(commands.flatMap(c => c.tags))
    return [...tags].sort()
  }, [commands])

  const filtered = useMemo(() => commands.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === null || c.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  }), [commands, searchQuery, selectedTag])

  const doneCount = commands.filter(c => c.progress?.status === 'done').length
  const learningCount = commands.filter(c => c.progress?.status === 'learning').length
  const completion = commands.length > 0 ? Math.round((doneCount / commands.length) * 100) : 0
  const featured = commands.find(c => c.progress?.status === 'learning') ?? commands.find(c => c.progress?.status !== 'done') ?? commands[0]
  const featuredProgress = featured?.progress?.status === 'done' ? 100 : featured?.progress?.status === 'learning' ? 60 : 15

  async function handleProgressChange(command: CommandWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('command', command.id, status)
    setCommands(prev => prev.map(c => c.id === command.id ? { ...c, progress: updated } : c))
  }

  async function handleDelete(id: number) {
    await api.commands.delete(id)
    setCommands(prev => prev.filter(c => c.id !== id))
    setDetailCommand(null)
  }

  function handleFormSuccess(updatedCommand: CommandWithProgress) {
    if (editingCommand) {
      setCommands(prev => prev.map(c => c.id === updatedCommand.id ? updatedCommand : c))
    } else {
      setCommands(prev => [...prev, updatedCommand])
    }
    setFormOpen(false)
    setEditingCommand(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 850 }}>Kubernetes Commands</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {commands.length} コマンド中 {doneCount} 完了
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingCommand(null); setFormOpen(true) }}>
          追加
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={theme => ({
              minHeight: 260,
              p: 2.75,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.light, 0.36),
              background: theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 78% 34%, rgba(139,61,255,0.32), transparent 28%), linear-gradient(135deg, rgba(45,20,94,0.92), rgba(10,18,36,0.96) 58%, rgba(9,14,28,0.98))'
                : 'linear-gradient(135deg, #ffffff, #eef2ff)',
              boxShadow: theme.palette.mode === 'dark' ? `0 24px 70px ${alpha(theme.palette.primary.main, 0.16)}` : '0 18px 44px rgba(56,71,112,0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              overflow: 'hidden',
              position: 'relative',
            })}
          >
            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.light', mb: 3 }}>
                <TrackChangesIcon fontSize="small" />
                <Typography sx={{ fontWeight: 850 }}>今日の学習</Typography>
              </Box>
              <Chip
                label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
                size="small"
                color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
                sx={{ mb: 1.25, fontWeight: 800 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.75, fontFamily: 'monospace' }}>
                {featured?.name ?? 'コマンドを追加してください'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2.5 }}>
                {featured?.description ?? '学習用のコマンドがまだありません'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5, maxWidth: 360 }}>
                <LinearProgress
                  variant="determinate"
                  value={featuredProgress}
                  sx={{ flex: 1, height: 7, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.16)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
                />
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{featuredProgress}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2.75 }}>
                {featured?.tags.slice(0, 4).map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.14)' }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  disabled={!featured}
                  onClick={onStartLearning}
                >
                  続きから学習する
                </Button>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  disabled={!featured}
                  onClick={() => featured && setDetailCommand(featured)}
                  sx={{ color: 'text.secondary', fontWeight: 800 }}
                >
                  詳細を見る
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', lg: 'grid' },
                placeItems: 'center',
                width: 190,
                flexShrink: 0,
                color: 'primary.light',
                fontSize: 92,
                fontWeight: 900,
                opacity: 0.7,
              }}
            >
              ⎈
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'grid', gap: 2, height: '100%' }}>
            <Box sx={statCardSx}>
              <BoltIcon sx={{ color: 'primary.light' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>完了率</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{completion}%</Typography>
              <LinearProgress variant="determinate" value={completion} sx={{ height: 7, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.16)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }} />
            </Box>
            <Box sx={statCardSx}>
              <CheckCircleIcon sx={{ color: 'secondary.main' }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 13, fontWeight: 700 }}>学習中</Typography>
              <Typography sx={{ fontSize: 28, fontWeight: 900 }}>{learningCount} 件</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>完了まであと {Math.max(commands.length - doneCount, 0)} 件</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          onClick={() => setSelectedTag(null)}
          sx={{ flexShrink: 0, bgcolor: 'background.paper' }}
        >
          フィルター
        </Button>
      </Box>

      <Grid container spacing={1.5}>
        {filtered.map(cmd => (
          <Grid key={cmd.id} size={{ xs: 12, md: 6 }}>
            <CommandCard
              command={cmd}
              onClick={() => setDetailCommand(cmd)}
              onProgressChange={status => handleProgressChange(cmd, status)}
            />
          </Grid>
        ))}
      </Grid>

      <CommandDetail
        command={detailCommand}
        onClose={() => setDetailCommand(null)}
        onEdit={cmd => { setEditingCommand(cmd); setDetailCommand(null); setFormOpen(true) }}
        onDelete={handleDelete}
      />
      <CommandForm
        open={formOpen}
        categoryId={categoryId}
        command={editingCommand}
        existingTags={allTags}
        onClose={() => { setFormOpen(false); setEditingCommand(null) }}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}

const statCardSx = {
  minHeight: 122,
  p: 2,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  backgroundImage: 'linear-gradient(135deg, rgba(24, 35, 58, 0.92), rgba(8, 15, 29, 0.96))',
}
