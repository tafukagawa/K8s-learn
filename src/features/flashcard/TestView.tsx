import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, TextField, ToggleButton, ToggleButtonGroup, Divider, CircularProgress, Chip } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, KnowledgeWithProgress, GradeRequest, GradeResult } from '../../types'
import { TestResultView } from './TestResultView'

type FilterMode = 'all' | 'unseen' | 'learning'
type FlashItem = CommandWithProgress | KnowledgeWithProgress

function isCommand(item: FlashItem): item is CommandWithProgress {
  return 'name' in item
}

interface TestViewProps {
  categoryId: number
  initialFilter?: FilterMode
  initialSection?: 'commands' | 'knowledge' | 'all'
  onBack?: () => void
}

export function TestView({ categoryId, initialFilter, initialSection, onBack }: TestViewProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [knowledge, setKnowledge] = useState<KnowledgeWithProgress[]>([])
  const [filter, setFilter] = useState<FilterMode>(initialFilter ?? 'all')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [grading, setGrading] = useState(false)
  const [results, setResults] = useState<GradeResult[] | null>(null)
  const [gradedItems, setGradedItems] = useState<FlashItem[]>([])

  useEffect(() => {
    Promise.all([api.commands.list(categoryId), api.knowledge.list(categoryId)])
      .then(([cmds, kn]) => { setCommands(cmds); setKnowledge(kn) })
  }, [categoryId])

  const items = useMemo<FlashItem[]>(() => {
    let base: FlashItem[]
    if (initialSection === 'commands') base = [...commands]
    else if (initialSection === 'knowledge') base = [...knowledge]
    else base = [...commands, ...knowledge]
    if (filter === 'unseen') return base.filter(i => !i.progress || i.progress.status === 'unseen')
    if (filter === 'learning') return base.filter(i => i.progress?.status === 'learning')
    return base
  }, [commands, knowledge, filter, initialSection])

  function itemKey(item: FlashItem) {
    return `${isCommand(item) ? 'command' : 'knowledge'}-${item.id}`
  }

  async function handleSubmit() {
    setGrading(true)
    const requests: GradeRequest[] = items.map(item => ({
      type: isCommand(item) ? 'command' : 'knowledge',
      id: item.id,
      question: isCommand(item) ? item.name : item.title,
      userAnswer: answers[itemKey(item)] ?? '',
      correctAnswer: isCommand(item)
        ? `${item.description}${item.syntax ? `\n構文: ${item.syntax}` : ''}`
        : item.body,
    }))
    try {
      const res = await api.ai.gradeAnswers(requests)
      setResults(res)
      setGradedItems(items)
    } finally {
      setGrading(false)
    }
  }

  function handleRetry() {
    setResults(null)
    setGradedItems([])
    setAnswers({})
  }

  if (results) {
    return (
      <TestResultView
        results={results}
        items={gradedItems}
        onRetry={handleRetry}
        onBack={onBack}
      />
    )
  }

  if (items.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">このフィルターに該当するアイテムがありません</Typography>
        <Button onClick={() => setFilter('all')}>全件を表示</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {onBack && (
        <Button startIcon={<ArrowBackIcon />} size="small" onClick={onBack} sx={{ mb: 2, color: 'text.secondary' }}>
          リファレンスに戻る
        </Button>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>テストモード</Typography>
          <Typography variant="body2" color="text.secondary">{items.length} 問 — 全問回答後にAI採点</Typography>
        </Box>
        <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
          <ToggleButton value="all">全件</ToggleButton>
          <ToggleButton value="unseen">未学習</ToggleButton>
          <ToggleButton value="learning">学習中</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((item, idx) => {
          const key = itemKey(item)
          const cmd = isCommand(item)
          return (
            <Box key={key} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25, minWidth: 28, fontWeight: 700 }}>
                  {idx + 1}.
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                    <Chip label={cmd ? 'Command' : 'Knowledge'} size="small" color={cmd ? 'primary' : 'secondary'} variant="outlined" />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: cmd ? 'monospace' : 'inherit',
                      fontWeight: 700,
                      fontSize: cmd ? 15 : 16,
                      color: cmd ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {cmd ? item.name : item.title}
                  </Typography>
                  {cmd && item.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {item.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />)}
                    </Box>
                  )}
                </Box>
              </Box>
              <TextField
                multiline
                minRows={cmd ? 2 : 3}
                fullWidth
                placeholder={cmd ? 'コマンドの説明・構文・使用例を入力...' : 'この概念の説明を入力...'}
                value={answers[key] ?? ''}
                onChange={e => setAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                size="small"
                sx={{ ml: 4.5 }}
              />
            </Box>
          )
        })}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={grading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={grading}
          sx={{ minWidth: 200 }}
        >
          {grading ? 'AI採点中...' : 'AI採点する'}
        </Button>
      </Box>
    </Box>
  )
}
