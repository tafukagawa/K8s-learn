import { Drawer, Box, Typography, Divider, IconButton, Button, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { CommandWithProgress } from '../../types'

interface CommandDetailProps {
  command: CommandWithProgress | null
  onClose: () => void
  onEdit: (command: CommandWithProgress) => void
  onDelete: (id: number) => void
}

export function CommandDetail({ command, onClose, onEdit, onDelete }: CommandDetailProps) {
  return (
    <Drawer anchor="right" open={!!command} onClose={onClose} slotProps={{ paper: { sx: { width: 420, p: 3 } } }}>
      {command && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>コマンド詳細</Typography>
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
          </Box>

          <Typography sx={{ fontFamily: 'monospace', fontSize: 14, color: 'primary.main', fontWeight: 700, bgcolor: '#a435f008', p: 1.5, borderRadius: 1, mb: 2 }}>
            {command.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>説明</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{command.description}</Typography>

          {command.syntax && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>構文</Typography>
              <Box sx={{ bgcolor: '#1c1d1f', color: '#f7f8fa', fontFamily: 'monospace', fontSize: 12, p: 1.5, borderRadius: 1, mb: 2 }}>
                {command.syntax}
              </Box>
            </>
          )}

          {command.example && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>使用例</Typography>
              <Box sx={{ bgcolor: '#1c1d1f', color: '#a435f0', fontFamily: 'monospace', fontSize: 12, p: 1.5, borderRadius: 1, mb: 2 }}>
                {command.example}
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
            {command.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(command)} size="small">
              編集
            </Button>
            {command.isCustom && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(command.id)} size="small">
                削除
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
