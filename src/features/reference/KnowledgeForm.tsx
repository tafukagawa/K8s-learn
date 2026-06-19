import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress } from '../../types'

interface KnowledgeFormProps {
  open: boolean
  categoryId: number
  item: KnowledgeWithProgress | null
  onClose: () => void
  onSuccess: (item: KnowledgeWithProgress) => void
}

export function KnowledgeForm({ open, categoryId, item, onClose, onSuccess }: KnowledgeFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title); setBody(item.body); setTagsInput(item.tags.join(', '))
    } else {
      setTitle(''); setBody(''); setTagsInput('')
    }
  }, [item, open])

  async function handleSubmit() {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (item) {
      const updated = await api.knowledge.update(item.id, { title, body, tags })
      onSuccess({ ...updated, progress: item.progress })
    } else {
      const created = await api.knowledge.create({ categoryId, title, body, tags })
      onSuccess({ ...created, progress: null })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? '知識を編集' : '知識を追加'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="タイトル" value={title} onChange={e => setTitle(e.target.value)} fullWidth size="small" required />
          <TextField label="本文（Markdown）" value={body} onChange={e => setBody(e.target.value)} fullWidth size="small" multiline rows={8} />
          <TextField label="タグ（カンマ区切り）" value={tagsInput} onChange={e => setTagsInput(e.target.value)} fullWidth size="small" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          {item ? '更新' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
