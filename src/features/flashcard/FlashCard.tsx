// src/features/flashcard/FlashCard.tsx
import { useState, useEffect, type ChangeEvent, type MouseEvent, type KeyboardEvent } from 'react'
import { Box, Typography, Chip, Button, TextField } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import EditNoteIcon from '@mui/icons-material/EditNote'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

function ClozeQuestion({ q, value, onChange }: { q: string; value: string; onChange: (v: string) => void }) {
  const parts = q.split('（）')
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
      <Typography component="span" sx={{ fontSize: 14 }}>{parts[0]}</Typography>
      <Box
        component="input"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
        sx={theme => ({
          border: '1px solid', borderColor: 'primary.main', borderRadius: 0.75,
          px: 1, py: 0.25, fontSize: 14, minWidth: 80, maxWidth: 160,
          bgcolor: theme.palette.mode === 'dark' ? '#1e2030' : '#f0f4ff',
          color: 'text.primary', outline: 'none',
          '&:focus': { borderColor: 'primary.light', boxShadow: '0 0 0 2px rgba(99,140,255,0.2)' },
        })}
      />
      {parts[1] && <Typography component="span" sx={{ fontSize: 14 }}>{parts[1]}</Typography>}
    </Box>
  )
}

export function FlashCard({ item, isFlipped, onFlip, onKnew, onDidntKnow }: FlashCardProps) {
  const [answer, setAnswer] = useState('')
  const [clozeAnswers, setClozeAnswers] = useState<string[]>([])
  const label = isCommand(item) ? item.name : item.title
  const isKnowledge = !isCommand(item)
  const cloze = isKnowledge ? (item as KnowledgeWithProgress).cloze : null

  useEffect(() => {
    setAnswer('')
    setClozeAnswers(cloze ? cloze.map(() => '') : [])
  }, [item])

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
      <Box
        onClick={onFlip}
        sx={{ perspective: '1200px', cursor: 'pointer', height: isKnowledge ? 360 : 320, mb: 3 }}
      >
        <Box
          sx={{
            position: 'relative', width: '100%', height: '100%',
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
            <Chip
              label={isKnowledge ? 'Knowledge' : 'Command'}
              size="small"
              color={isKnowledge ? 'secondary' : 'primary'}
              variant="outlined"
              sx={{ alignSelf: 'flex-end' }}
            />
            <Typography
              variant={isKnowledge ? 'h5' : 'h3'}
              sx={{ fontWeight: 700, textAlign: 'center', fontFamily: isCommand(item) ? 'monospace' : 'inherit', color: isCommand(item) ? 'primary.main' : 'text.primary' }}
            >
              {label}
            </Typography>

            {isKnowledge && cloze ? (
              /* 穴埋め形式 */
              <Box onClick={e => e.stopPropagation()} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, color: 'secondary.light' }}>
                  <EditNoteIcon fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>空欄を埋めてください</Typography>
                </Box>
                {cloze.map((ci, i) => (
                  <ClozeQuestion
                    key={i}
                    q={ci.q}
                    value={clozeAnswers[i] ?? ''}
                    onChange={v => setClozeAnswers(prev => { const next = [...prev]; next[i] = v; return next })}
                  />
                ))}
              </Box>
            ) : isKnowledge ? (
              /* 自由記述形式 */
              <Box onClick={e => e.stopPropagation()} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, color: 'text.secondary' }}>
                  <EditNoteIcon fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>この概念を説明してみよう</Typography>
                </Box>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="説明を入力してください..."
                  size="small"
                  onKeyDown={e => e.stopPropagation()}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {item.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
              </Box>
            )}

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
            ) : cloze ? (
              /* 穴埋め正解表示 */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>答え合わせ</Typography>
                {cloze.map((ci, i) => {
                  const userAns = (clozeAnswers[i] ?? '').trim()
                  const correct = ci.a.trim()
                  const hit = userAns !== '' && (userAns === correct || correct.includes(userAns) || userAns.includes(correct))
                  return (
                    <Box key={i} sx={{ p: 1.25, borderRadius: 1, border: '1px solid', borderColor: hit ? 'success.main' : 'divider', bgcolor: hit ? 'rgba(32,201,151,0.07)' : 'action.hover' }}>
                      <Typography sx={{ fontSize: 13, mb: 0.5 }}>{ci.q.replace('（）', `【${correct}】`)}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', fontSize: 12 }}>
                        <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
                          あなた: <Box component="span" sx={{ color: userAns ? 'text.primary' : 'text.disabled' }}>{userAns || '（未入力）'}</Box>
                        </Typography>
                        <Typography component="span" sx={{ fontSize: 12, color: hit ? 'success.main' : 'warning.main', fontWeight: 800 }}>
                          {hit ? '✓ 正解' : `正解: ${correct}`}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ) : (
              /* 自由記述正解表示 */
              <Box>
                {answer.trim() && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>あなたの回答：</Typography>
                    <Box sx={{ mt: 0.5, p: 1.25, bgcolor: 'action.hover', borderRadius: 1, fontSize: 13, lineHeight: 1.6 }}>
                      {answer}
                    </Box>
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>正解：</Typography>
                <Box sx={{
                  mt: 0.5, fontSize: 14, lineHeight: 1.7, color: 'text.primary',
                  '& p': { mt: 0, mb: 1 },
                  '& code': { fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: 13 },
                  '& pre': { bgcolor: '#1c1d1f', color: '#f7f8fa', p: 1.5, borderRadius: 1, overflow: 'auto', fontSize: 12 },
                  '& pre code': { bgcolor: 'transparent', p: 0 },
                  '& ul, & ol': { pl: 2.5, mb: 1 },
                  '& table': { borderCollapse: 'collapse', width: '100%', mb: 1 },
                  '& th, & td': { border: '1px solid', borderColor: 'divider', p: '4px 8px', fontSize: 12 },
                  '& th': { bgcolor: 'action.hover', fontWeight: 700 },
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{(item as KnowledgeWithProgress).body}</ReactMarkdown>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* アクションボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={onDidntKnow} disabled={!isFlipped} sx={{ minWidth: 140 }}>
          まだ (N)
        </Button>
        <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={onKnew} disabled={!isFlipped} sx={{ minWidth: 140 }}>
          覚えてた (Y)
        </Button>
      </Box>
    </Box>
  )
}
