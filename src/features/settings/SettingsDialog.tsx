import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box,
} from '@mui/material'
import { getGithubToken, setGithubToken, clearGithubToken } from './githubToken'

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: Props) {
  const [token, setToken] = useState(() => getGithubToken() ?? '')

  function handleSave() {
    if (token.trim()) setGithubToken(token.trim())
    else clearGithubToken()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>設定</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
          URLからナレッジを生成するには GitHub Personal Access Token（PAT）が必要です。
          <br />必要スコープ: <Box component="code" sx={{ bgcolor: 'action.hover', px: 0.75, borderRadius: 0.5 }}>workflow</Box>
        </Typography>
        <TextField
          label="GitHub PAT"
          value={token}
          onChange={e => setToken(e.target.value)}
          type="password"
          fullWidth
          size="small"
          placeholder="ghp_xxxxxxxxxxxx"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button variant="contained" onClick={handleSave}>保存</Button>
      </DialogActions>
    </Dialog>
  )
}
