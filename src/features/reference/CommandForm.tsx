import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material'
import { api } from '../../shared/ipc'
import type { CommandWithProgress } from '../../types'

interface CommandFormProps {
  open: boolean
  categoryId: number
  command: CommandWithProgress | null
  onClose: () => void
  onSuccess: (command: CommandWithProgress) => void
}

export function CommandForm({ open, categoryId, command, onClose, onSuccess }: CommandFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [syntax, setSyntax] = useState('')
  const [example, setExample] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (command) {
      setName(command.name)
      setDescription(command.description)
      setSyntax(command.syntax)
      setExample(command.example)
      setTagsInput(command.tags.join(', '))
    } else {
      setName(''); setDescription(''); setSyntax(''); setExample(''); setTagsInput('')
    }
  }, [command, open])

  async function handleSubmit() {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (command) {
      const updated = await api.commands.update(command.id, { name, description, syntax, example, tags })
      onSuccess({ ...updated, progress: command.progress })
    } else {
      const created = await api.commands.create({ categoryId, name, description, syntax, example, tags })
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
          <TextField label="タグ（カンマ区切り）" value={tagsInput} onChange={e => setTagsInput(e.target.value)} fullWidth size="small" placeholder="pod, debug, get" />
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
