# Autoplay Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact autoplay carousel (56px) above the tabs in ReferenceView that cycles through the current section's knowledge and command items every 5 seconds with a slide-in animation.

**Architecture:** One new component `AutoplayCarousel` fetches knowledge + commands via existing `api`, merges them, and cycles with `setInterval`. A `key` change on the inner Box triggers CSS `@keyframes slideInFromRight` on each tick. ReferenceView inserts it above the existing `<Tabs>`.

**Tech Stack:** React 18 hooks (`useState`, `useEffect`, `useRef`, `useCallback`), MUI v6 (`Box`, `Typography`, `Chip`), CSS `@keyframes` via MUI `sx`

---

## File Map

| File | Action |
|---|---|
| `src/features/reference/AutoplayCarousel.tsx` | Create — self-contained carousel component |
| `src/features/reference/ReferenceView.tsx` | Modify — import and render `<AutoplayCarousel>` above `<Tabs>` |

---

### Task 1: Create AutoplayCarousel component

**Files:**
- Create: `src/features/reference/AutoplayCarousel.tsx`

**Key types (from `src/types/index.ts`):**
- `Knowledge`: `{ id, title, body, ... }`
- `Command`: `{ id, name, description, ... }`
- `api.knowledge.list(categoryId, sectionId?)` → `Promise<KnowledgeWithProgress[]>`
- `api.commands.list(categoryId, sectionId?)` → `Promise<CommandWithProgress[]>`

- [ ] **Step 1: Create `src/features/reference/AutoplayCarousel.tsx`** with the complete implementation:

```tsx
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
```

**Animation notes:**
- `key={index}` on the inner Box forces remount on each tick → CSS animation replays
- `from: translateX(100%)` starts the item off-screen to the right
- Container `overflow: hidden` clips the out-of-view position
- On hover: `stopInterval` pauses; `onMouseLeave` resumes via `startInterval`

- [ ] **Step 2: Commit**

```bash
git add src/features/reference/AutoplayCarousel.tsx
git commit -m "feat: add AutoplayCarousel component for reference view"
```

---

### Task 2: Wire AutoplayCarousel into ReferenceView

**Files:**
- Modify: `src/features/reference/ReferenceView.tsx`

Current file for reference (lines 1–18):
```tsx
import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { CommandList } from './CommandList'
import { KnowledgeList } from './KnowledgeList'

interface ReferenceViewProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: (contentType: 'commands' | 'knowledge') => void
}

export function ReferenceView({ categoryId, sectionId, searchQuery, onStartLearning }: ReferenceViewProps) {
  const [tab, setTab] = useState<'commands' | 'knowledge'>('knowledge')

  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      <Tabs ...>
```

- [ ] **Step 1: Add import for `AutoplayCarousel`**

Add after line 5 (`import { KnowledgeList } from './KnowledgeList'`):

```tsx
import { AutoplayCarousel } from './AutoplayCarousel'
```

- [ ] **Step 2: Insert `<AutoplayCarousel>` before `<Tabs>`**

Find this block:
```tsx
  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      <Tabs
```

Replace with:
```tsx
  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      <AutoplayCarousel categoryId={categoryId} sectionId={sectionId} />
      <Tabs
```

- [ ] **Step 3: Verify visually**

Run `npm run dev:web` (or `npm run dev`).
Open the app → select a section with 2+ items → the carousel bar should appear above the tabs, auto-advance every 5 seconds, slide in from the right, and pause on hover.

Check edge cases:
- Section with 1 item → carousel is hidden ✓
- Switch section → carousel resets to index 0 with new items ✓

- [ ] **Step 4: Commit**

```bash
git add src/features/reference/ReferenceView.tsx
git commit -m "feat: add AutoplayCarousel to ReferenceView above tabs"
```
