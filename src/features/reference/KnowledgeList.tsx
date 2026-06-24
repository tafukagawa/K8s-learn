import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Chip, LinearProgress, IconButton, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  PlusIcon, PlayIcon, ArrowRightIcon,
  PencilIcon, TrashIcon, CheckIcon, ZapIcon,
} from '@primer/octicons-react'
import { TagFilter } from './TagFilter'
import { KnowledgeDetail } from './KnowledgeDetail'
import { KnowledgeForm } from './KnowledgeForm'
import { api } from '../../shared/ipc'
import { stripMarkdown } from '../../shared/stripMarkdown'
import type { KnowledgeWithProgress, ProgressStatus, ClozeItem } from '../../types'

interface KnowledgeListProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: () => void
}

export function KnowledgeList({ categoryId, sectionId, searchQuery, onStartLearning }: KnowledgeListProps) {
  const [items, setItems] = useState<KnowledgeWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<KnowledgeWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeWithProgress | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [ollamaGuideOpen, setOllamaGuideOpen] = useState(false)

  useEffect(() => {
    api.knowledge.list(categoryId, sectionId).then(setItems)
    setSelectedTag(null)
  }, [categoryId, sectionId])

  const allTags = useMemo(() => [...new Set(items.flatMap(i => i.tags))].sort(), [items])

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

  async function cycleStatus(item: KnowledgeWithProgress) {
    const current = item.progress?.status ?? 'unseen'
    const next: ProgressStatus = current === 'unseen' ? 'learning' : current === 'learning' ? 'done' : 'unseen'
    await handleProgressChange(item, next)
  }

  async function handleDelete(id: number) {
    await api.knowledge.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDetailItem(null)
  }

  async function handleGenerateCloze(item: KnowledgeWithProgress) {
    const { ok } = await api.ai.checkOllama()
    if (!ok) { setOllamaGuideOpen(true); return }
    setGeneratingId(item.id)
    try {
      const cloze: ClozeItem[] = await api.ai.generateCloze(item.id)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, cloze } : i))
    } finally {
      setGeneratingId(null)
    }
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
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Kubernetes Knowledge</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {items.length} 件中 {doneCount} 完了
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Box sx={{ display: 'flex' }}><PlusIcon size={14} /></Box>}
          onClick={() => { setEditingItem(null); setFormOpen(true) }}
        >
          追加
        </Button>
      </Box>

      {/* 今日の理解テーマ サマリー */}
      <Box sx={{
        mb: 2.5, p: 2.5, borderRadius: 1,
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', justifyContent: 'space-between', gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.light', mb: 1.5 }}>
            <Box sx={{ display: 'flex' }}><ZapIcon size={14} /></Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>今日の理解テーマ</Typography>
          </Box>
          <Chip
            label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
            size="small"
            color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
            sx={{ mb: 1, fontWeight: 600 }}
          />
          <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: 16 }}>
            {featured?.title ?? 'ナレッジを追加してください'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
            {featured ? '概念を確認して、コマンドの背景を理解する' : '学習用のナレッジがまだありません'}
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
              onClick={() => featured && setDetailItem(featured)}
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
            ナレッジが見つかりません
          </Box>
        )}
        {filtered.map((item, index) => {
          const status = item.progress?.status ?? 'unseen'
          const bodyPreview = stripMarkdown(item.body)
          return (
            <Box
              key={item.id}
              onClick={() => setDetailItem(item)}
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
                onClick={e => { e.stopPropagation(); cycleStatus(item) }}
                sx={{ mr: 1.5, flexShrink: 0, cursor: 'pointer' }}
              >
                <StatusIndicator status={status} />
              </Box>

              {/* コンテンツ */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                  {item.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                    {bodyPreview.slice(0, 80)}{bodyPreview.length > 80 ? '...' : ''}
                  </Typography>
                  {item.tags.map(tag => (
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
                  onClick={() => handleGenerateCloze(item)}
                  disabled={generatingId === item.id}
                >
                  <Box sx={{ display: 'flex' }}><ZapIcon size={12} /></Box>
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => { setEditingItem(item); setDetailItem(null); setFormOpen(true) }}
                >
                  <Box sx={{ display: 'flex' }}><PencilIcon size={12} /></Box>
                </IconButton>
                {item.isCustom && (
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Box sx={{ display: 'flex' }}><TrashIcon size={12} /></Box>
                  </IconButton>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

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

      <Dialog open={ollamaGuideOpen} onClose={() => setOllamaGuideOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ollama が起動していません</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            穴埋め問題の生成には Ollama のローカル AI が必要です。以下の手順で起動してください。
          </Typography>
          <Box component="ol" sx={{ pl: 2.5, fontSize: 14, lineHeight: 2 }}>
            <li>Ollama がインストール済みであることを確認</li>
            <li>ターミナルで <Box component="code" sx={{ bgcolor: 'action.hover', px: 0.75, borderRadius: 0.5 }}>ollama serve</Box> を実行</li>
            <li>初回のみ: <Box component="code" sx={{ bgcolor: 'action.hover', px: 0.75, borderRadius: 0.5 }}>ollama pull qwen2.5:3b</Box> でモデルを取得</li>
            <li>起動後、もう一度「穴埋め生成」ボタンを押す</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOllamaGuideOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
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
