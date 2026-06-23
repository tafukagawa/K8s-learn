import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, Chip } from '@mui/material'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress } from '../../types'

interface KnowledgeFormProps {
  open: boolean
  categoryId: number
  item: KnowledgeWithProgress | null
  existingTags: string[]
  onClose: () => void
  onSuccess: (item: KnowledgeWithProgress) => void
}

export function KnowledgeForm({ open, categoryId, item, existingTags, onClose, onSuccess }: KnowledgeFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title); setBody(item.body); setTags(item.tags); setUrl(item.url)
    } else {
      setTitle(''); setBody(''); setTags([]); setUrl('')
    }
  }, [item, open])

  async function handleSubmit() {
    if (item) {
      const updated = await api.knowledge.update(item.id, { title, body, tags, url })
      onSuccess({ ...updated, progress: item.progress })
    } else {
      const created = await api.knowledge.create({ categoryId, title, body, tags, url })
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
          <Autocomplete
            multiple
            freeSolo
            options={existingTags}
            value={tags}
            onChange={(_, newValue) => setTags(newValue)}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index })
                return <Chip label={option} size="small" key={key} {...itemProps} />
              })
            }
            renderInput={params => (
              <TextField {...params} label="タグ" size="small" placeholder={tags.length === 0 ? 'タグを選択または入力...' : ''} />
            )}
          />
          <TextField
            label="公式ドキュメント URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            fullWidth
            size="small"
            placeholder="https://kubernetes.io/docs/..."
          />
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
