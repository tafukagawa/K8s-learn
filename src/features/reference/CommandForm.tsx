import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, Chip } from '@mui/material'
import { api } from '../../shared/ipc'
import type { CommandWithProgress } from '../../types'

interface CommandFormProps {
  open: boolean
  categoryId: number
  command: CommandWithProgress | null
  existingTags: string[]
  onClose: () => void
  onSuccess: (command: CommandWithProgress) => void
}

export function CommandForm({ open, categoryId, command, existingTags, onClose, onSuccess }: CommandFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [syntax, setSyntax] = useState('')
  const [example, setExample] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (command) {
      setName(command.name)
      setDescription(command.description)
      setSyntax(command.syntax)
      setExample(command.example)
      setTags(command.tags)
      setUrl(command.url)
    } else {
      setName(''); setDescription(''); setSyntax(''); setExample(''); setTags([]); setUrl('')
    }
  }, [command, open])

  async function handleSubmit() {
    if (command) {
      const updated = await api.commands.update(command.id, { name, description, syntax, example, tags, url })
      onSuccess({ ...updated, progress: command.progress })
    } else {
      const created = await api.commands.create({ categoryId, name, description, syntax, example, tags, url })
      onSuccess({ ...created, progress: null })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{command ? 'コマンドを編集' : 'コマンドを追加'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="コマンド名" value={name} onChange={e => setName(e.target.value)} fullWidth size="small" required />
          <TextField label="説明" value={description} onChange={e => setDescription(e.target.value)} fullWidth size="small" multiline rows={2} />
          <TextField label="構文" value={syntax} onChange={e => setSyntax(e.target.value)} fullWidth size="small" />
          <TextField label="使用例" value={example} onChange={e => setExample(e.target.value)} fullWidth size="small" />
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
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          {command ? '更新' : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
