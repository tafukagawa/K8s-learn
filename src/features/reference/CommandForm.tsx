import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, Chip, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, RefLink } from '../../types'

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
  const [refs, setRefs] = useState<RefLink[]>([])

  useEffect(() => {
    if (command) {
      setName(command.name)
      setDescription(command.description)
      setSyntax(command.syntax)
      setExample(command.example)
      setTags(command.tags)
      setUrl(command.url)
      setRefs(command.refs ?? [])
    } else {
      setName(''); setDescription(''); setSyntax(''); setExample(''); setTags([]); setUrl(''); setRefs([])
    }
  }, [command, open])

  async function handleSubmit() {
    if (command) {
      const updated = await api.commands.update(command.id, { name, description, syntax, example, tags, url, refs })
      onSuccess({ ...updated, progress: command.progress })
    } else {
      const created = await api.commands.create({ categoryId, name, description, syntax, example, tags, url, refs })
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
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">参考リンク</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setRefs(r => [...r, { label: '', url: '' }])}
              >
                追加
              </Button>
            </Box>
            {refs.map((ref, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="ラベル"
                  value={ref.label}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  size="small"
                  sx={{ width: 140 }}
                  placeholder="Qiita記事"
                />
                <TextField
                  label="URL"
                  value={ref.url}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="https://..."
                />
                <IconButton size="small" onClick={() => setRefs(r => r.filter((_, j) => j !== i))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
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
