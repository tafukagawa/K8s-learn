import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Chip, LinearProgress, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  PlusIcon, PlayIcon, ArrowRightIcon,
  PencilIcon, TrashIcon, CheckIcon, ZapIcon,
} from '@primer/octicons-react'
import { TagFilter } from './TagFilter'
import { CommandDetail } from './CommandDetail'
import { CommandForm } from './CommandForm'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, ProgressStatus } from '../../types'

interface CommandListProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: () => void
}

export function CommandList({ categoryId, sectionId, searchQuery, onStartLearning }: CommandListProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailCommand, setDetailCommand] = useState<CommandWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<CommandWithProgress | null>(null)

  useEffect(() => {
    api.commands.list(categoryId, sectionId).then(setCommands)
    setSelectedTag(null)
  }, [categoryId, sectionId])

  const allTags = useMemo(() => [...new Set(commands.flatMap(c => c.tags))].sort(), [commands])

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

  async function handleProgressChange(command: CommandWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('command', command.id, status)
    setCommands(prev => prev.map(c => c.id === command.id ? { ...c, progress: updated } : c))
  }

  async function cycleStatus(command: CommandWithProgress) {
    const current = command.progress?.status ?? 'unseen'
    const next: ProgressStatus = current === 'unseen' ? 'learning' : current === 'learning' ? 'done' : 'unseen'
    await handleProgressChange(command, next)
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
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Kubernetes Commands</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {commands.length} コマンド中 {doneCount} 完了
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Box sx={{ display: 'flex' }}><PlusIcon size={14} /></Box>}
          onClick={() => { setEditingCommand(null); setFormOpen(true) }}
        >
          追加
        </Button>
      </Box>

      {/* 今日の学習サマリー */}
      <Box sx={{
        mb: 2.5, p: 2.5, borderRadius: 1,
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', justifyContent: 'space-between', gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.light', mb: 1.5 }}>
            <Box sx={{ display: 'flex' }}><ZapIcon size={14} /></Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>今日の学習</Typography>
          </Box>
          <Chip
            label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
            size="small"
            color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
            sx={{ mb: 1, fontWeight: 600 }}
          />
          <Typography sx={{ fontWeight: 600, mb: 0.5, fontFamily: 'monospace', fontSize: 16 }}>
            {featured?.name ?? 'コマンドを追加してください'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
            {featured?.description ?? '学習用のコマンドがまだありません'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2, maxWidth: 360 }}>
            <LinearProgress
              variant="determinate"
              value={completion}
              sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Box sx={{ display: 'flex' }}><PlayIcon size={12} /></Box>}
              disabled={!featured}
              onClick={onStartLearning}
            >
              続きから学習する
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<Box sx={{ display: 'flex' }}><ArrowRightIcon size={12} /></Box>}
              disabled={!featured}
              onClick={() => featured && setDetailCommand(featured)}
            >
              詳細を見る
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, minWidth: 140 }}>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>完了率</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>学習中</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{learningCount} 件</Typography>
          </Box>
        </Box>
      </Box>

      {/* タグフィルター */}
      <Box sx={{ mb: 1.5 }}>
        <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />
      </Box>

      {/* テーブルリスト */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {filtered.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
            コマンドが見つかりません
          </Box>
        )}
        {filtered.map((cmd, index) => {
          const status = cmd.progress?.status ?? 'unseen'
          return (
            <Box
              key={cmd.id}
              onClick={() => setDetailCommand(cmd)}
              sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 1.25,
                borderBottom: index < filtered.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '& .row-actions': { opacity: 0 },
                '&:hover .row-actions': { opacity: 1 },
              }}
            >
              {/* ステータスインジケーター */}
              <Box
                onClick={e => { e.stopPropagation(); cycleStatus(cmd) }}
                sx={{ mr: 1.5, flexShrink: 0, cursor: 'pointer' }}
              >
                <StatusIndicator status={status} />
              </Box>

              {/* コンテンツ */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: 'text.primary' }}>
                  {cmd.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {cmd.description}
                  </Typography>
                  {cmd.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ height: 16, fontSize: 10, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* ステータスバッジ */}
              <Box sx={{ mx: 1.5, flexShrink: 0 }}>
                <StatusBadge status={status} />
              </Box>

              {/* アクション */}
              <Box
                className="row-actions"
                sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => { setEditingCommand(cmd); setDetailCommand(null); setFormOpen(true) }}
                >
                  <Box sx={{ display: 'flex' }}><PencilIcon size={12} /></Box>
                </IconButton>
                {cmd.isCustom && (
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={() => handleDelete(cmd.id)}
                  >
                    <Box sx={{ display: 'flex' }}><TrashIcon size={12} /></Box>
                  </IconButton>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

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

function StatusIndicator({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Box sx={{
        width: 16, height: 16, borderRadius: 0.5,
        bgcolor: 'primary.main',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color: '#fff', display: 'flex' }}><CheckIcon size={10} /></Box>
      </Box>
    )
  }
  if (status === 'learning') {
    return (
      <Box sx={{
        width: 16, height: 16, border: '1px solid',
        borderColor: 'primary.main', borderRadius: 0.5,
        bgcolor: theme => alpha(theme.palette.primary.main, 0.20),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.light' }} />
      </Box>
    )
  }
  return (
    <Box sx={{ width: 16, height: 16, border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }} />
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Chip
        label="完了"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(46,160,67,0.15)', border: '1px solid #238636', color: '#3fb950', borderRadius: 99 }}
      />
    )
  }
  if (status === 'learning') {
    return (
      <Chip
        label="学習中"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: theme => alpha(theme.palette.primary.main, 0.15), border: '1px solid', borderColor: theme => alpha(theme.palette.primary.main, 0.4), color: 'primary.light', borderRadius: 99 }}
      />
    )
  }
  return null
}
