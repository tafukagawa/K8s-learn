// src/features/flashcard/FlashCard.tsx
import { Box, Typography, Chip, Button } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ReactMarkdown from 'react-markdown'
import type { CommandWithProgress, KnowledgeWithProgress } from '../../types'

export type FlashItem = CommandWithProgress | KnowledgeWithProgress

export function isCommand(item: FlashItem): item is CommandWithProgress {
  return 'name' in item
}

interface FlashCardProps {
  item: FlashItem
  isFlipped: boolean
  onFlip: () => void
  onKnew: () => void
  onDidntKnow: () => void
}

export function FlashCard({ item, isFlipped, onFlip, onKnew, onDidntKnow }: FlashCardProps) {
  const label = isCommand(item) ? item.name : item.title
  const typeLabel = isCommand(item) ? 'Command' : 'Knowledge'

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
      {/* 3Dカード */}
      <Box
        onClick={onFlip}
        sx={{ perspective: '1200px', cursor: 'pointer', height: 320, mb: 3 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 180ms ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* 表面 */}
          <Box sx={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderRadius: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            p: 4, gap: 2,
          }}>
            <Chip label={typeLabel} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-end' }} />
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', fontFamily: isCommand(item) ? 'monospace' : 'inherit', color: isCommand(item) ? 'primary.main' : 'text.primary' }}>
              {label}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              {item.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
              クリックまたは Space でめくる
            </Typography>
          </Box>

          {/* 裏面 */}
          <Box sx={{
            position: 'absolute', width: '100%', height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderRadius: 2,
            overflow: 'auto',
            p: 3,
          }}>
            {isCommand(item) ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">説明</Typography>
                <Typography variant="body1">{item.description}</Typography>
                {item.syntax && (
                  <>
                    <Typography variant="body2" color="text.secondary">構文</Typography>
                    <Box sx={{ bgcolor: '#1c1d1f', color: '#f7f8fa', fontFamily: 'monospace', fontSize: 12, p: 1.5, borderRadius: 1 }}>
                      {item.syntax}
                    </Box>
                  </>
                )}
                {item.example && (
                  <>
                    <Typography variant="body2" color="text.secondary">使用例</Typography>
                    <Box sx={{ bgcolor: '#1c1d1f', color: '#a435f0', fontFamily: 'monospace', fontSize: 12, p: 1.5, borderRadius: 1 }}>
                      {item.example}
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{
                fontSize: 14, lineHeight: 1.7, color: 'text.primary',
                '& p': { mt: 0, mb: 1 },
                '& code': { fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: 13 },
                '& pre': { bgcolor: '#1c1d1f', color: '#f7f8fa', p: 1.5, borderRadius: 1, overflow: 'auto', fontSize: 12 },
                '& pre code': { bgcolor: 'transparent', p: 0 },
                '& ul, & ol': { pl: 2.5, mb: 1 },
              }}>
                <ReactMarkdown>{item.body}</ReactMarkdown>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* アクションボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CloseIcon />}
          onClick={onDidntKnow}
          disabled={!isFlipped}
          sx={{ minWidth: 140 }}
        >
          まだ (N)
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckIcon />}
          onClick={onKnew}
          disabled={!isFlipped}
          sx={{ minWidth: 140 }}
        >
          覚えてた (Y)
        </Button>
      </Box>
    </Box>
  )
}
