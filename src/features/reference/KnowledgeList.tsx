import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Grid2 as Grid } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { KnowledgeCard } from './KnowledgeCard'
import { KnowledgeDetail } from './KnowledgeDetail'
import { KnowledgeForm } from './KnowledgeForm'
import { TagFilter } from './TagFilter'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress, ProgressStatus } from '../../types'

interface KnowledgeListProps {
  categoryId: number
  searchQuery: string
}

export function KnowledgeList({ categoryId, searchQuery }: KnowledgeListProps) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Kubernetes Knowledge</Typography>
          <Typography variant="caption" color="text.secondary">
            {items.length} 件 · {items.filter(i => i.progress?.status === 'done').length} 完了
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setEditingItem(null); setFormOpen(true) }}>
          追加
        </Button>
      </Box>

      <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />

      <Grid container spacing={1.5}>
        {filtered.map(item => (
          <Grid key={item.id} size={6}>
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
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}
