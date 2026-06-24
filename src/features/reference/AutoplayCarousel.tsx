import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { api } from '../../shared/ipc'

type CarouselItem =
  | { type: 'knowledge'; id: number; title: string; body: string }
  | { type: 'command'; id: number; name: string; description: string }

interface AutoplayCarouselProps {
  categoryId: number
  sectionId: number
}

export function AutoplayCarousel({ categoryId, sectionId }: AutoplayCarouselProps) {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    Promise.all([
      api.knowledge.list(categoryId, sectionId),
      api.commands.list(categoryId, sectionId),
    ]).then(([knowledge, commands]) => {
      const mapped: CarouselItem[] = [
        ...knowledge.map(k => ({ type: 'knowledge' as const, id: k.id, title: k.title, body: k.body })),
        ...commands.map(c => ({ type: 'command' as const, id: c.id, name: c.name, description: c.description })),
      ]
      setItems(mapped)
      setIndex(0)
    })
  }, [categoryId, sectionId])

  const advance = useCallback(() => {
    setIndex(i => (i + 1) % items.length)
  }, [items.length])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(advance, 5000)
  }, [advance])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (items.length < 2) return
    startInterval()
    return stopInterval
  }, [items.length, startInterval, stopInterval])

  if (items.length < 2) return null

  const item = items[index]
  const label = item.type === 'knowledge' ? 'ナレッジ' : 'コマンド'
  const title = item.type === 'knowledge' ? item.title : item.name
  const subtitle = item.type === 'knowledge' ? item.body : item.description

  return (
    <Box
      onMouseEnter={stopInterval}
      onMouseLeave={startInterval}
      sx={{
        mb: 2,
        height: 56,
        overflow: 'hidden',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        cursor: 'default',
      }}
    >
      <Box
        key={index}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          '@keyframes slideInFromRight': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
          animation: 'slideInFromRight 0.35s ease',
        }}
      >
        <Chip
          label={label}
          size="small"
          color={item.type === 'knowledge' ? 'primary' : 'success'}
          sx={{ flexShrink: 0, fontSize: 11, height: 20 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          <Typography noWrap sx={{ fontSize: 11, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
          {index + 1} / {items.length}
        </Typography>
      </Box>
    </Box>
  )
}
