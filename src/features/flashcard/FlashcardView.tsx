// src/features/flashcard/FlashcardView.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Box, Typography, ToggleButton, ToggleButtonGroup, Button, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import { FlashCard, isCommand, type FlashItem } from './FlashCard'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, KnowledgeWithProgress } from '../../types'

type FilterMode = 'all' | 'unseen' | 'learning'

interface FlashcardViewProps {
  categoryId: number
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardView({ categoryId }: FlashcardViewProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [knowledge, setKnowledge] = useState<KnowledgeWithProgress[]>([])
  const [filter, setFilter] = useState<FilterMode>('all')
  const [deck, setDeck] = useState<FlashItem[]>([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  // useRef で stale closure を防ぐ
  const indexRef = useRef(index)
  const deckRef = useRef(deck)
  const isFlippedRef = useRef(isFlipped)
  useEffect(() => { indexRef.current = index }, [index])
  useEffect(() => { deckRef.current = deck }, [deck])
  useEffect(() => { isFlippedRef.current = isFlipped }, [isFlipped])

  useEffect(() => {
    Promise.all([api.commands.list(categoryId), api.knowledge.list(categoryId)])
      .then(([cmds, kn]) => { setCommands(cmds); setKnowledge(kn) })
  }, [categoryId])

  const filtered = useMemo<FlashItem[]>(() => {
    const all: FlashItem[] = [...commands, ...knowledge]
    if (filter === 'unseen') return all.filter(i => !i.progress || i.progress.status === 'unseen')
    if (filter === 'learning') return all.filter(i => i.progress?.status === 'learning')
    return all
  }, [commands, knowledge, filter])

  const restart = useCallback(() => {
    setDeck(shuffleArray(filtered))
    setIndex(0)
    setIsFlipped(false)
    setFinished(false)
  }, [filtered])

  useEffect(() => { restart() }, [restart])

  const goNext = useCallback(() => {
    const idx = indexRef.current
    const d = deckRef.current
    if (idx >= d.length - 1) { setFinished(true); return }
    setIndex(idx + 1)
    setIsFlipped(false)
  }, [])

  const goPrev = useCallback(() => {
    const idx = indexRef.current
    if (idx > 0) { setIndex(idx - 1); setIsFlipped(false) }
  }, [])

  const handleKnew = useCallback(async () => {
    const item = deckRef.current[indexRef.current]
    if (!item) return
    await api.progress.upsert(isCommand(item) ? 'command' : 'knowledge', item.id, 'done')
    goNext()
  }, [goNext])

  const handleDidntKnow = useCallback(async () => {
    const item = deckRef.current[indexRef.current]
    if (!item) return
    await api.progress.upsert(isCommand(item) ? 'command' : 'knowledge', item.id, 'learning')
    goNext()
  }, [goNext])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(f => !f); return }
      if (e.code === 'ArrowRight' || e.code === 'ArrowDown') { goNext(); return }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') { goPrev(); return }
      if ((e.key === 'y' || e.key === 'Y') && isFlippedRef.current) { handleKnew(); return }
      if ((e.key === 'n' || e.key === 'N') && isFlippedRef.current) { handleDidntKnow(); return }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, handleKnew, handleDidntKnow])

  const current = deck[index]

  if (deck.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">このフィルターに該当するカードがありません</Typography>
        <Button onClick={() => setFilter('all')}>全件を表示</Button>
      </Box>
    )
  }

  if (finished) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>セッション完了！</Typography>
        <Typography color="text.secondary">{deck.length} 枚のカードを確認しました</Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={restart}>もう一度</Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      {/* ヘッダー：フィルター + 進捗 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="all">全件</ToggleButton>
          <ToggleButton value="unseen">未学習</ToggleButton>
          <ToggleButton value="learning">学習中</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary">
          {index + 1} / {deck.length}
        </Typography>
      </Box>

      {/* カード */}
      {current && (
        <FlashCard
          item={current}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(f => !f)}
          onKnew={handleKnew}
          onDidntKnow={handleDidntKnow}
        />
      )}

      {/* ナビゲーション */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <IconButton onClick={goPrev} disabled={index === 0}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="caption" color="text.secondary">
          Space: めくる　Y/N: 判定　←→: 移動
        </Typography>
        <IconButton onClick={goNext}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
