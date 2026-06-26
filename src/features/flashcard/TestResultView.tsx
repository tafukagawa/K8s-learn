import { Box, Typography, Button, Chip, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { GradeResult, CommandWithProgress, KnowledgeWithProgress } from '../../types'

type FlashItem = CommandWithProgress | KnowledgeWithProgress

function isCommand(item: FlashItem): item is CommandWithProgress {
  return 'name' in item
}

interface TestResultViewProps {
  results: GradeResult[]
  items: FlashItem[]
  onRetry: () => void
  onBack?: () => void
}

const verdictConfig = {
  correct:   { label: '正解',   color: 'success' as const, icon: CheckCircleIcon,  bg: 'rgba(32,201,151,0.07)',  border: 'success.main' },
  partial:   { label: '部分点', color: 'warning' as const, icon: RemoveCircleIcon, bg: 'rgba(255,193,7,0.07)',   border: 'warning.main' },
  incorrect: { label: '不正解', color: 'error'   as const, icon: CancelIcon,       bg: 'rgba(244,67,54,0.07)',   border: 'error.main'   },
}

export function TestResultView({ results, items, onRetry, onBack }: TestResultViewProps) {
  const correctCount = results.filter(r => r.verdict === 'correct').length
  const partialCount = results.filter(r => r.verdict === 'partial').length
  const incorrectCount = results.filter(r => r.verdict === 'incorrect').length

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {onBack && (
        <Button startIcon={<ArrowBackIcon />} size="small" onClick={onBack} sx={{ mb: 2, color: 'text.secondary' }}>
          リファレンスに戻る
        </Button>
      )}

      {/* スコアサマリー */}
      <Box sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>採点結果</Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
          {correctCount} <Typography component="span" variant="h5" color="text.secondary">/ {results.length}</Typography>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Chip icon={<CheckCircleIcon />} label={`正解 ${correctCount}`} color="success" variant="outlined" />
          <Chip icon={<RemoveCircleIcon />} label={`部分点 ${partialCount}`} color="warning" variant="outlined" />
          <Chip icon={<CancelIcon />} label={`不正解 ${incorrectCount}`} color="error" variant="outlined" />
        </Box>
      </Box>

      {/* 各問の結果 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {results.map((result, idx) => {
          const item = items.find(i => i.id === result.id)
          if (!item) return null
          const cfg = verdictConfig[result.verdict]
          const VerdictIcon = cfg.icon
          const cmd = isCommand(item)

          return (
            <Box key={result.id} sx={{ p: 2.5, border: '1px solid', borderColor: cfg.border, borderRadius: 2, bgcolor: cfg.bg }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, minWidth: 28 }}>{idx + 1}.</Typography>
                <VerdictIcon color={cfg.color} fontSize="small" />
                <Chip label={cfg.label} color={cfg.color} size="small" />
                <Typography sx={{ fontWeight: 700, fontFamily: cmd ? 'monospace' : 'inherit', color: cmd ? 'primary.main' : 'text.primary' }}>
                  {cmd ? item.name : item.title}
                </Typography>
              </Box>

              {result.comment && (
                <Typography variant="body2" sx={{ ml: 4.5, mb: 1.5, color: 'text.secondary', fontStyle: 'italic' }}>
                  {result.comment}
                </Typography>
              )}

              {result.verdict !== 'correct' && (
                <Box sx={{ ml: 4.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>正解：</Typography>
                  {cmd ? (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{result.correctAnswer}</Typography>
                  ) : (
                    <Box sx={{
                      mt: 0.5, fontSize: 13, lineHeight: 1.7,
                      '& p': { mt: 0, mb: 1 },
                      '& code': { fontFamily: 'monospace', bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5, fontSize: 12 },
                      '& pre': { bgcolor: '#1c1d1f', color: '#f7f8fa', p: 1.5, borderRadius: 1, overflow: 'auto', fontSize: 11 },
                      '& pre code': { bgcolor: 'transparent', p: 0 },
                      '& ul, & ol': { pl: 2, mb: 1 },
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.correctAnswer}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
          もう一度テスト
        </Button>
        {onBack && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            リファレンスに戻る
          </Button>
        )}
      </Box>
    </Box>
  )
}
