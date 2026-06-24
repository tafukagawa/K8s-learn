import { Dialog, DialogContent, Box, Typography, Divider, IconButton, Button, Chip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress } from '../../types'

interface KnowledgeDetailProps {
  item: KnowledgeWithProgress | null
  onClose: () => void
  onEdit: (item: KnowledgeWithProgress) => void
  onDelete: (id: number) => void
}

export function KnowledgeDetail({ item, onClose, onEdit, onDelete }: KnowledgeDetailProps) {
  return (
    <Dialog open={!!item} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        {item && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
              <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
              {item.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
            </Box>

            <Box sx={{
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              mb: 3,
              fontSize: 14,
              lineHeight: 1.7,
              color: 'text.primary',
              '& p': { mt: 0, mb: 1 },
              '& code': { fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: 13 },
              '& pre': { bgcolor: '#1c1d1f', color: '#f7f8fa', p: 1.5, borderRadius: 1, overflow: 'auto', fontSize: 12 },
              '& pre code': { bgcolor: 'transparent', p: 0 },
              '& ul, & ol': { pl: 2.5, mb: 1 },
              '& h1, & h2, & h3': { mt: 1.5, mb: 0.5 },
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>
            </Box>

            {item.url && (
              <Button
                variant="text"
                size="small"
                startIcon={<OpenInNewIcon fontSize="small" />}
                onClick={() => api.shell.openExternal(item.url)}
                sx={{ mb: 2 }}
              >
                公式ドキュメント
              </Button>
            )}

            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(item)} size="small">編集</Button>
              {item.isCustom && (
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(item.id)} size="small">削除</Button>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
