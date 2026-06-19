import { Drawer, Box, Typography, Divider, IconButton, Button, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { KnowledgeWithProgress } from '../../types'

interface KnowledgeDetailProps {
  item: KnowledgeWithProgress | null
  onClose: () => void
  onEdit: (item: KnowledgeWithProgress) => void
  onDelete: (id: number) => void
}

export function KnowledgeDetail({ item, onClose, onEdit, onDelete }: KnowledgeDetailProps) {
  return (
    <Drawer anchor="right" open={!!item} onClose={onClose} slotProps={{ paper: { sx: { width: 480, p: 3 } } }}>
      {item && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {item.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
          </Box>

          <Box sx={{ bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 3, fontFamily: 'system-ui', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
            {item.body}
          </Box>

          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(item)} size="small">編集</Button>
            {item.isCustom && (
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(item.id)} size="small">削除</Button>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
