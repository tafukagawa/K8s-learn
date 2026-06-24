# GitHub Dark UI リデザイン Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub 公式ダークモード配色 + Octicons アイコン + テーブルリスト一覧に全面リデザインする。

**Architecture:** MUI テーマのカラーパレットを GitHub Dark に更新し、全コンポーネントのアイコンを `@primer/octicons-react` に置き換える。コマンド/ナレッジの一覧表示は大きいカードから GitHub Issues 風のコンパクトなテーブルリストに変更し、行クリックで既存の詳細ダイアログを開く構造を維持する。

**Tech Stack:** React 19, MUI v9, TypeScript, @primer/octicons-react

---

## File Map

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/shared/theme.ts` | Modify | GitHub Dark パレット、borderRadius:6、fontWeight:500 |
| `src/shared/components/Header.tsx` | Modify | Octicons 置き換え、GitHub dark スタイル |
| `src/shared/components/Sidebar.tsx` | Modify | Octicons 置き換え、選択状態色更新、進捗ウィジェット維持 |
| `src/features/reference/CommandList.tsx` | Modify | カードGrid → テーブルリスト |
| `src/features/reference/KnowledgeList.tsx` | Modify | カードGrid → テーブルリスト |
| `src/features/reference/CommandCard.tsx` | Delete | テーブルリスト化により不要 |
| `src/features/reference/KnowledgeCard.tsx` | Delete | テーブルリスト化により不要 |

---

## Task 1: @primer/octicons-react をインストール

**Files:**
- Modify: `package.json`

- [ ] **Step 1: パッケージをインストールする**

```bash
cd C:/Users/fukagawa/work/k8s-learning-app
npm install @primer/octicons-react
```

Expected: `package.json` に `@primer/octicons-react` が追加される。

- [ ] **Step 2: インストールを確認する**

```bash
node -e "const o = require('@primer/octicons-react'); console.log('OK:', Object.keys(o).slice(0,5))"
```

Expected: `OK: [ 'AlertFillIcon', 'AlertIcon', ...]` のように出力される。

- [ ] **Step 3: コミットする**

```bash
git add package.json package-lock.json
git commit -m "chore: add @primer/octicons-react"
```

---

## Task 2: テーマを GitHub Dark に更新

**Files:**
- Modify: `src/shared/theme.ts`

- [ ] **Step 1: theme.ts を書き換える**

`src/shared/theme.ts` を以下の内容に完全置き換えする:

```typescript
import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#1f6feb' : '#0969da',
        light: isDark ? '#58a6ff' : '#218bff',
        dark: isDark ? '#1158c7' : '#0550ae',
      },
      secondary: {
        main: isDark ? '#3fb950' : '#2da44e',
        light: isDark ? '#56d364' : '#4ac26b',
        dark: isDark ? '#2ea043' : '#1a7f37',
      },
      background: {
        default: isDark ? '#0d1117' : '#F5F7FA',
        paper: isDark ? '#161b22' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e6edf3' : '#1E3658',
        secondary: isDark ? '#8b949e' : '#4B6A8E',
      },
      success: { main: isDark ? '#3fb950' : '#2da44e' },
      warning: { main: '#d29922' },
      error: { main: '#f85149' },
      divider: isDark ? '#30363d' : '#d0d7de',
      action: {
        hover: isDark ? '#21262d' : 'rgba(208,215,222,0.32)',
      },
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      h5: { letterSpacing: 0, fontWeight: 600 },
      h6: { letterSpacing: 0, fontWeight: 600 },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: isDark ? '#0d1117' : '#F5F7FA' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#161b22' : '#ffffff',
            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 6,
            boxShadow: 'none',
            '&.MuiButton-containedPrimary': {
              background: isDark ? '#1f6feb' : '#0969da',
              border: `1px solid rgba(240,246,252,0.1)`,
              '&:hover': { background: isDark ? '#1158c7' : '#0550ae', boxShadow: 'none' },
            },
            '&.MuiButton-outlinedPrimary': {
              background: isDark ? '#21262d' : 'transparent',
              borderColor: isDark ? '#30363d' : '#0969da',
              color: isDark ? '#c9d1d9' : '#0969da',
              '&:hover': {
                background: isDark ? '#30363d' : alpha('#0969da', 0.08),
                borderColor: isDark ? '#30363d' : '#0969da',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 6,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#161b22' : undefined,
            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500, borderRadius: 999 } },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
    },
  })
}
```

- [ ] **Step 2: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミットする**

```bash
git add src/shared/theme.ts
git commit -m "feat: update theme to GitHub Dark palette"
```

---

## Task 3: Header を GitHub スタイルに更新

**Files:**
- Modify: `src/shared/components/Header.tsx`

- [ ] **Step 1: Header.tsx を書き換える**

`src/shared/components/Header.tsx` を以下の内容に完全置き換えする:

```typescript
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MarkGithubIcon, SearchIcon, BellIcon, MoonIcon, SunIcon } from '@primer/octicons-react'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  darkMode: boolean
  onToggleDark: () => void
}

export function Header({ searchQuery, onSearchChange, darkMode, onToggleDark }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 56 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
          <Box sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            <MarkGithubIcon size={24} />
          </Box>
          <Typography sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 14 }}>
            k8s Learn
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={theme => ({
          display: 'flex', alignItems: 'center', width: 280,
          bgcolor: 'background.default',
          border: '1px solid', borderColor: 'divider',
          borderRadius: 1, px: 1.5, py: 0.625,
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        })}>
          <Box sx={{ color: 'text.secondary', display: 'flex', mr: 0.75 }}>
            <SearchIcon size={14} />
          </Box>
          <InputBase
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="検索（コマンド名・説明）"
            sx={{ color: 'text.primary', fontSize: 13, flex: 1 }}
          />
          <Box sx={{
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            borderRadius: 0.5, px: 0.75, fontSize: 11, color: 'text.secondary', lineHeight: '20px',
          }}>
            /
          </Box>
        </Box>

        <Tooltip title="通知">
          <IconButton size="small" disabled sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>
              <BellIcon size={14} />
            </Box>
          </IconButton>
        </Tooltip>

        <Tooltip title={darkMode ? 'ライトモード' : 'ダークモード'}>
          <IconButton onClick={onToggleDark} size="small" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>
              {darkMode ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </Box>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
```

- [ ] **Step 2: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 3: コミットする**

```bash
git add src/shared/components/Header.tsx
git commit -m "feat: update Header to GitHub style with Octicons"
```

---

## Task 4: Sidebar を GitHub スタイルに更新

**Files:**
- Modify: `src/shared/components/Sidebar.tsx`

- [ ] **Step 1: Sidebar.tsx を書き換える**

`src/shared/components/Sidebar.tsx` を以下の内容に完全置き換えする（進捗ウィジェットのロジックは維持）:

```typescript
import { useState, useEffect } from 'react'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, LinearProgress, Collapse,
} from '@mui/material'
import {
  StackIcon, CompassIcon, QuestionIcon,
  ChevronDownIcon, ChevronRightIcon,
} from '@primer/octicons-react'
import { alpha } from '@mui/material/styles'
import { api } from '../../shared/ipc'
import type { Category, Section } from '../../types'

export type AppView =
  | { mode: 'flashcard' }
  | { mode: 'roadmap' }
  | { mode: 'reference'; categoryId: number; sectionId: number }
  | { mode: 'help' }

interface SidebarProps {
  categories: Category[]
  view: AppView
  onViewChange: (view: AppView) => void
  doneCount: number
  totalCount: number
}

export function Sidebar({ categories, view, onViewChange, doneCount, totalCount }: SidebarProps) {
  const [sections, setSections] = useState<Record<number, Section[]>>({})
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (categories.length === 0 || expandedCats.size > 0) return
    const first = categories[0]
    setExpandedCats(new Set([first.id]))
    api.sections.list(first.id).then(loaded => {
      setSections(prev => ({ ...prev, [first.id]: loaded }))
      if (loaded.length > 0) {
        onViewChange({ mode: 'reference', categoryId: first.id, sectionId: loaded[0].id })
      }
    })
  }, [categories.length])

  function toggleCat(cat: Category) {
    const next = new Set(expandedCats)
    if (next.has(cat.id)) {
      next.delete(cat.id)
    } else {
      next.add(cat.id)
      if (!sections[cat.id]) {
        api.sections.list(cat.id).then(loaded => {
          setSections(prev => ({ ...prev, [cat.id]: loaded }))
        })
      }
    }
    setExpandedCats(next)
  }

  const isRefView = view.mode === 'reference'
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <Box sx={theme => ({
      width: 252,
      bgcolor: theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
      borderRight: '1px solid',
      borderColor: 'divider',
      p: 1.5,
      flexShrink: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
    })}>

      {/* 学習ツール */}
      <Box>
        <Typography variant="caption" sx={labelSx}>学習ツール</Typography>
        <List dense disablePadding>
          {/* フラッシュカード */}
          <ListItemButton
            selected={view.mode === 'flashcard'}
            onClick={() => onViewChange({ mode: 'flashcard' })}
            sx={theme => ({
              borderRadius: 1, mb: 0.5, px: 1, minHeight: 36,
              bgcolor: view.mode === 'flashcard'
                ? alpha(theme.palette.primary.main, 0.10)
                : undefined,
            })}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Box sx={{ color: view.mode === 'flashcard' ? 'primary.light' : 'text.secondary', display: 'flex' }}>
                <StackIcon size={14} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="フラッシュカード"
              slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'flashcard' ? 600 : 400, color: view.mode === 'flashcard' ? 'primary.light' : 'text.primary' } } }}
            />
          </ListItemButton>

          {/* ロードマップ */}
          <ListItemButton
            selected={view.mode === 'roadmap'}
            onClick={() => onViewChange({ mode: 'roadmap' })}
            sx={theme => ({
              borderRadius: 1, mb: 0.25, px: 1, minHeight: 36,
              bgcolor: view.mode === 'roadmap'
                ? alpha(theme.palette.primary.main, 0.10)
                : undefined,
            })}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Box sx={{ color: view.mode === 'roadmap' ? 'primary.light' : 'text.secondary', display: 'flex' }}>
                <CompassIcon size={14} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="ロードマップ"
              slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'roadmap' ? 600 : 400, color: view.mode === 'roadmap' ? 'primary.light' : 'text.primary' } } }}
            />
          </ListItemButton>

          {/* 学習進捗ウィジェット（既存デザイン維持） */}
          <Box sx={theme => ({
            mx: 1, mb: 0.5, p: 1.25,
            bgcolor: 'background.default',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          })}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>学習進捗</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
              <Box sx={theme => ({
                width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: '50%',
                background: `conic-gradient(${theme.palette.primary.main} ${progress}%, rgba(148,163,184,0.14) 0)`,
                position: 'relative', flexShrink: 0,
                '&::after': {
                  content: '""', position: 'absolute', inset: 6,
                  borderRadius: '50%', bgcolor: 'background.default',
                },
              })}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{doneCount}</Typography>
                  <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>/{totalCount}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{Math.round(progress)}% 完了</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>あと {Math.max(0, totalCount - doneCount)} 件</Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 3, borderRadius: 1, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 1 } }}
            />
          </Box>
        </List>
      </Box>

      {/* カテゴリツリー */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Typography variant="caption" sx={labelSx}>カテゴリ</Typography>
        <List dense disablePadding>
          {categories.map(cat => {
            const isCatOpen = expandedCats.has(cat.id)
            const catSections = sections[cat.id] ?? []
            return (
              <Box key={cat.id}>
                <ListItemButton onClick={() => toggleCat(cat)} sx={{ borderRadius: 1, py: 0.6, px: 1, mb: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 20 }}>
                    <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                      {isCatOpen
                        ? <ChevronDownIcon size={13} />
                        : <ChevronRightIcon size={13} />}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={cat.name}
                    slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }}
                  />
                </ListItemButton>
                <Collapse in={isCatOpen} unmountOnExit>
                  {catSections.map(sec => {
                    const sel = isRefView && view.categoryId === cat.id && view.sectionId === sec.id
                    return (
                      <ListItemButton
                        key={sec.id}
                        selected={sel}
                        onClick={() => onViewChange({ mode: 'reference', categoryId: cat.id, sectionId: sec.id })}
                        sx={theme => ({
                          borderRadius: 1, py: 0.4, pl: 3.5, pr: 1, mb: 0.1,
                          borderLeft: `2px solid ${sel ? theme.palette.primary.main : 'transparent'}`,
                          bgcolor: sel ? alpha(theme.palette.primary.main, 0.10) : undefined,
                        })}
                      >
                        <ListItemText
                          primary={sec.title}
                          slotProps={{ primary: { sx: { fontSize: 12, fontWeight: sel ? 600 : 400, color: sel ? 'primary.light' : 'text.secondary' } } }}
                        />
                      </ListItemButton>
                    )
                  })}
                </Collapse>
              </Box>
            )
          })}
        </List>
      </Box>

      {/* ヘルプ */}
      <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          selected={view.mode === 'help'}
          onClick={() => onViewChange({ mode: 'help' })}
          sx={theme => ({
            borderRadius: 1, px: 1, minHeight: 36,
            bgcolor: view.mode === 'help' ? alpha(theme.palette.primary.main, 0.10) : undefined,
          })}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <Box sx={{ color: view.mode === 'help' ? 'primary.light' : 'text.secondary', display: 'flex' }}>
              <QuestionIcon size={14} />
            </Box>
          </ListItemIcon>
          <ListItemText
            primary="ヘルプ"
            slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'help' ? 600 : 400, color: view.mode === 'help' ? 'primary.light' : 'text.primary' } } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )
}

const labelSx = {
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.5,
  mb: 0.75,
  display: 'block',
  fontWeight: 600,
  fontSize: '0.65rem',
}
```

- [ ] **Step 2: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし。もし `StackIcon` や `CompassIcon` が見つからないエラーが出た場合は以下で利用可能な名前を確認する:

```bash
node -e "const o=require('@primer/octicons-react');console.log(Object.keys(o).filter(k=>k.includes('Stack')||k.includes('Compass')||k.includes('Map')))"
```

- [ ] **Step 3: コミットする**

```bash
git add src/shared/components/Sidebar.tsx
git commit -m "feat: update Sidebar to GitHub style with Octicons"
```

---

## Task 5: CommandList をテーブルリストに変更

**Files:**
- Modify: `src/features/reference/CommandList.tsx`
- Delete: `src/features/reference/CommandCard.tsx`

- [ ] **Step 1: CommandCard.tsx を削除する**

```bash
rm src/features/reference/CommandCard.tsx
```

- [ ] **Step 2: CommandList.tsx を書き換える**

`src/features/reference/CommandList.tsx` を以下の内容に完全置き換えする:

```typescript
import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Chip, LinearProgress, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  PlusIcon, PlayIcon, ArrowRightIcon,
  PencilIcon, TrashIcon, CheckIcon, ZapIcon,
} from '@primer/octicons-react'
import { TagFilter } from './TagFilter'
import { CommandDetail } from './CommandDetail'
import { CommandForm } from './CommandForm'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, ProgressStatus } from '../../types'

interface CommandListProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: () => void
}

export function CommandList({ categoryId, sectionId, searchQuery, onStartLearning }: CommandListProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailCommand, setDetailCommand] = useState<CommandWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<CommandWithProgress | null>(null)

  useEffect(() => {
    api.commands.list(categoryId, sectionId).then(setCommands)
    setSelectedTag(null)
  }, [categoryId, sectionId])

  const allTags = useMemo(() => [...new Set(commands.flatMap(c => c.tags))].sort(), [commands])

  const filtered = useMemo(() => commands.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === null || c.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  }), [commands, searchQuery, selectedTag])

  const doneCount = commands.filter(c => c.progress?.status === 'done').length
  const learningCount = commands.filter(c => c.progress?.status === 'learning').length
  const completion = commands.length > 0 ? Math.round((doneCount / commands.length) * 100) : 0
  const featured = commands.find(c => c.progress?.status === 'learning') ?? commands.find(c => c.progress?.status !== 'done') ?? commands[0]

  async function handleProgressChange(command: CommandWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('command', command.id, status)
    setCommands(prev => prev.map(c => c.id === command.id ? { ...c, progress: updated } : c))
  }

  async function cycleStatus(command: CommandWithProgress) {
    const current = command.progress?.status ?? 'unseen'
    const next: ProgressStatus = current === 'unseen' ? 'learning' : current === 'learning' ? 'done' : 'unseen'
    await handleProgressChange(command, next)
  }

  async function handleDelete(id: number) {
    await api.commands.delete(id)
    setCommands(prev => prev.filter(c => c.id !== id))
    setDetailCommand(null)
  }

  function handleFormSuccess(updatedCommand: CommandWithProgress) {
    if (editingCommand) {
      setCommands(prev => prev.map(c => c.id === updatedCommand.id ? updatedCommand : c))
    } else {
      setCommands(prev => [...prev, updatedCommand])
    }
    setFormOpen(false)
    setEditingCommand(null)
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Kubernetes Commands</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {commands.length} コマンド中 {doneCount} 完了
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Box sx={{ display: 'flex' }}><PlusIcon size={14} /></Box>}
          onClick={() => { setEditingCommand(null); setFormOpen(true) }}
        >
          追加
        </Button>
      </Box>

      {/* 今日の学習サマリー */}
      <Box sx={theme => ({
        mb: 2.5, p: 2.5, borderRadius: 1,
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', justifyContent: 'space-between', gap: 2,
      })}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.light', mb: 1.5 }}>
            <Box sx={{ display: 'flex' }}><ZapIcon size={14} /></Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>今日の学習</Typography>
          </Box>
          <Chip
            label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
            size="small"
            color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
            sx={{ mb: 1, fontWeight: 600 }}
          />
          <Typography sx={{ fontWeight: 600, mb: 0.5, fontFamily: 'monospace', fontSize: 16 }}>
            {featured?.name ?? 'コマンドを追加してください'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
            {featured?.description ?? '学習用のコマンドがまだありません'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2, maxWidth: 360 }}>
            <LinearProgress
              variant="determinate"
              value={completion}
              sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Box sx={{ display: 'flex' }}><PlayIcon size={12} /></Box>}
              disabled={!featured}
              onClick={onStartLearning}
            >
              続きから学習する
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<Box sx={{ display: 'flex' }}><ArrowRightIcon size={12} /></Box>}
              disabled={!featured}
              onClick={() => featured && setDetailCommand(featured)}
            >
              詳細を見る
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, minWidth: 140 }}>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>完了率</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>学習中</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{learningCount} 件</Typography>
          </Box>
        </Box>
      </Box>

      {/* タグフィルター */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />
      </Box>

      {/* テーブルリスト */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {filtered.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
            コマンドが見つかりません
          </Box>
        )}
        {filtered.map((cmd, index) => {
          const status = cmd.progress?.status ?? 'unseen'
          return (
            <Box
              key={cmd.id}
              onClick={() => setDetailCommand(cmd)}
              sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 1.25,
                borderBottom: index < filtered.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '& .row-actions': { opacity: 0 },
                '&:hover .row-actions': { opacity: 1 },
              }}
            >
              {/* ステータスインジケーター */}
              <Box
                onClick={e => { e.stopPropagation(); cycleStatus(cmd) }}
                sx={{ mr: 1.5, flexShrink: 0, cursor: 'pointer' }}
              >
                <StatusIndicator status={status} />
              </Box>

              {/* コンテンツ */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: 'text.primary' }}>
                  {cmd.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {cmd.description}
                  </Typography>
                  {cmd.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ height: 16, fontSize: 10, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* ステータスバッジ */}
              <Box sx={{ mx: 1.5, flexShrink: 0 }}>
                <StatusBadge status={status} />
              </Box>

              {/* アクション */}
              <Box
                className="row-actions"
                sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => { setEditingCommand(cmd); setDetailCommand(null); setFormOpen(true) }}
                >
                  <Box sx={{ display: 'flex' }}><PencilIcon size={12} /></Box>
                </IconButton>
                {cmd.isCustom && (
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={() => handleDelete(cmd.id)}
                  >
                    <Box sx={{ display: 'flex' }}><TrashIcon size={12} /></Box>
                  </IconButton>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

      <CommandDetail
        command={detailCommand}
        onClose={() => setDetailCommand(null)}
        onEdit={cmd => { setEditingCommand(cmd); setDetailCommand(null); setFormOpen(true) }}
        onDelete={handleDelete}
      />
      <CommandForm
        open={formOpen}
        categoryId={categoryId}
        command={editingCommand}
        existingTags={allTags}
        onClose={() => { setFormOpen(false); setEditingCommand(null) }}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}

function StatusIndicator({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Box sx={{
        width: 16, height: 16, borderRadius: 0.5,
        bgcolor: 'primary.main',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color: '#fff', display: 'flex' }}><CheckIcon size={10} /></Box>
      </Box>
    )
  }
  if (status === 'learning') {
    return (
      <Box sx={{
        width: 16, height: 16, border: '1px solid',
        borderColor: 'primary.main', borderRadius: 0.5,
        bgcolor: theme => alpha(theme.palette.primary.main, 0.20),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.light' }} />
      </Box>
    )
  }
  return (
    <Box sx={{ width: 16, height: 16, border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }} />
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Chip
        label="完了"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(46,160,67,0.15)', border: '1px solid #238636', color: '#3fb950', borderRadius: 99 }}
      />
    )
  }
  if (status === 'learning') {
    return (
      <Chip
        label="学習中"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: theme => alpha(theme.palette.primary.main, 0.15), border: '1px solid', borderColor: theme => alpha(theme.palette.primary.main, 0.4), color: 'primary.light', borderRadius: 99 }}
      />
    )
  }
  return null
}
```

- [ ] **Step 3: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし。`ArrowRightIcon` が見つからない場合は `ChevronRightIcon` で代替する。

- [ ] **Step 4: コミットする**

```bash
git add src/features/reference/CommandList.tsx
git rm src/features/reference/CommandCard.tsx
git commit -m "feat: replace CommandList cards with GitHub-style table rows"
```

---

## Task 6: KnowledgeList をテーブルリストに変更

**Files:**
- Modify: `src/features/reference/KnowledgeList.tsx`
- Delete: `src/features/reference/KnowledgeCard.tsx`

- [ ] **Step 1: KnowledgeCard.tsx を削除する**

```bash
rm src/features/reference/KnowledgeCard.tsx
```

- [ ] **Step 2: KnowledgeList.tsx を書き換える**

`src/features/reference/KnowledgeList.tsx` を以下の内容に完全置き換えする:

```typescript
import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Chip, LinearProgress, IconButton, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  PlusIcon, PlayIcon, ArrowRightIcon,
  PencilIcon, TrashIcon, CheckIcon, ZapIcon,
} from '@primer/octicons-react'
import { TagFilter } from './TagFilter'
import { KnowledgeDetail } from './KnowledgeDetail'
import { KnowledgeForm } from './KnowledgeForm'
import { api } from '../../shared/ipc'
import type { KnowledgeWithProgress, ProgressStatus, ClozeItem } from '../../types'

interface KnowledgeListProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: () => void
}

export function KnowledgeList({ categoryId, sectionId, searchQuery, onStartLearning }: KnowledgeListProps) {
  const [items, setItems] = useState<KnowledgeWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<KnowledgeWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeWithProgress | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [ollamaGuideOpen, setOllamaGuideOpen] = useState(false)

  useEffect(() => {
    api.knowledge.list(categoryId, sectionId).then(setItems)
    setSelectedTag(null)
  }, [categoryId, sectionId])

  const allTags = useMemo(() => [...new Set(items.flatMap(i => i.tags))].sort(), [items])

  const filtered = useMemo(() => items.filter(i => {
    const matchesSearch = searchQuery === '' ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === null || i.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  }), [items, searchQuery, selectedTag])

  const doneCount = items.filter(i => i.progress?.status === 'done').length
  const learningCount = items.filter(i => i.progress?.status === 'learning').length
  const completion = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0
  const featured = items.find(i => i.progress?.status === 'learning') ?? items.find(i => i.progress?.status !== 'done') ?? items[0]

  async function handleProgressChange(item: KnowledgeWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('knowledge', item.id, status)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: updated } : i))
  }

  async function cycleStatus(item: KnowledgeWithProgress) {
    const current = item.progress?.status ?? 'unseen'
    const next: ProgressStatus = current === 'unseen' ? 'learning' : current === 'learning' ? 'done' : 'unseen'
    await handleProgressChange(item, next)
  }

  async function handleDelete(id: number) {
    await api.knowledge.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDetailItem(null)
  }

  async function handleGenerateCloze(item: KnowledgeWithProgress) {
    const { ok } = await api.ai.checkOllama()
    if (!ok) { setOllamaGuideOpen(true); return }
    setGeneratingId(item.id)
    try {
      const cloze: ClozeItem[] = await api.ai.generateCloze(item.id)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, cloze } : i))
    } finally {
      setGeneratingId(null)
    }
  }

  function handleFormSuccess(updatedItem: KnowledgeWithProgress) {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i))
    } else {
      setItems(prev => [...prev, updatedItem])
    }
    setFormOpen(false)
    setEditingItem(null)
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Kubernetes Knowledge</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {items.length} 件中 {doneCount} 完了
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Box sx={{ display: 'flex' }}><PlusIcon size={14} /></Box>}
          onClick={() => { setEditingItem(null); setFormOpen(true) }}
        >
          追加
        </Button>
      </Box>

      {/* 今日の理解テーマ サマリー */}
      <Box sx={{
        mb: 2.5, p: 2.5, borderRadius: 1,
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex', justifyContent: 'space-between', gap: 2,
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.light', mb: 1.5 }}>
            <Box sx={{ display: 'flex' }}><ZapIcon size={14} /></Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>今日の理解テーマ</Typography>
          </Box>
          <Chip
            label={featured?.progress?.status === 'learning' ? '学習中' : featured?.progress?.status === 'done' ? '完了' : '未学習'}
            size="small"
            color={featured?.progress?.status === 'done' ? 'success' : featured?.progress?.status === 'learning' ? 'warning' : 'default'}
            sx={{ mb: 1, fontWeight: 600 }}
          />
          <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: 16 }}>
            {featured?.title ?? 'ナレッジを追加してください'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: 13 }}>
            {featured ? '概念を確認して、コマンドの背景を理解する' : '学習用のナレッジがまだありません'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2, maxWidth: 360 }}>
            <LinearProgress
              variant="determinate"
              value={completion}
              sx={{ flex: 1, height: 4, borderRadius: 999, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
            />
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Box sx={{ display: 'flex' }}><PlayIcon size={12} /></Box>}
              disabled={!featured}
              onClick={onStartLearning}
            >
              続きから学習する
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<Box sx={{ display: 'flex' }}><ArrowRightIcon size={12} /></Box>}
              disabled={!featured}
              onClick={() => featured && setDetailItem(featured)}
            >
              詳細を見る
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, minWidth: 140 }}>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>完了率</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{completion}%</Typography>
          </Box>
          <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 600 }}>学習中</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{learningCount} 件</Typography>
          </Box>
        </Box>
      </Box>

      {/* タグフィルター */}
      <Box sx={{ mb: 1.5 }}>
        <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />
      </Box>

      {/* テーブルリスト */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        {filtered.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>
            ナレッジが見つかりません
          </Box>
        )}
        {filtered.map((item, index) => {
          const status = item.progress?.status ?? 'unseen'
          return (
            <Box
              key={item.id}
              onClick={() => setDetailItem(item)}
              sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 1.25,
                borderBottom: index < filtered.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '& .row-actions': { opacity: 0 },
                '&:hover .row-actions': { opacity: 1 },
              }}
            >
              {/* ステータスインジケーター */}
              <Box
                onClick={e => { e.stopPropagation(); cycleStatus(item) }}
                sx={{ mr: 1.5, flexShrink: 0, cursor: 'pointer' }}
              >
                <StatusIndicator status={status} />
              </Box>

              {/* コンテンツ */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                  {item.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                    {item.body.slice(0, 80)}{item.body.length > 80 ? '...' : ''}
                  </Typography>
                  {item.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ height: 16, fontSize: 10, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* ステータスバッジ */}
              <Box sx={{ mx: 1.5, flexShrink: 0 }}>
                <StatusBadge status={status} />
              </Box>

              {/* アクション */}
              <Box
                className="row-actions"
                sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => handleGenerateCloze(item)}
                  disabled={generatingId === item.id}
                >
                  <Box sx={{ display: 'flex' }}><ZapIcon size={12} /></Box>
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() => { setEditingItem(item); setDetailItem(null); setFormOpen(true) }}
                >
                  <Box sx={{ display: 'flex' }}><PencilIcon size={12} /></Box>
                </IconButton>
                {item.isCustom && (
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Box sx={{ display: 'flex' }}><TrashIcon size={12} /></Box>
                  </IconButton>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

      <KnowledgeDetail
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={i => { setEditingItem(i); setDetailItem(null); setFormOpen(true) }}
        onDelete={handleDelete}
      />
      <KnowledgeForm
        open={formOpen}
        categoryId={categoryId}
        item={editingItem}
        existingTags={allTags}
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onSuccess={handleFormSuccess}
      />

      <Dialog open={ollamaGuideOpen} onClose={() => setOllamaGuideOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ollama が起動していません</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            穴埋め問題の生成には Ollama のローカル AI が必要です。以下の手順で起動してください。
          </Typography>
          <Box component="ol" sx={{ pl: 2.5, fontSize: 14, lineHeight: 2 }}>
            <li>Ollama がインストール済みであることを確認</li>
            <li>ターミナルで <Box component="code" sx={{ bgcolor: 'action.hover', px: 0.75, borderRadius: 0.5 }}>ollama serve</Box> を実行</li>
            <li>初回のみ: <Box component="code" sx={{ bgcolor: 'action.hover', px: 0.75, borderRadius: 0.5 }}>ollama pull qwen2.5:3b</Box> でモデルを取得</li>
            <li>起動後、もう一度「穴埋め生成」ボタンを押す</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOllamaGuideOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function StatusIndicator({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Box sx={{
        width: 16, height: 16, borderRadius: 0.5,
        bgcolor: 'primary.main',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ color: '#fff', display: 'flex' }}><CheckIcon size={10} /></Box>
      </Box>
    )
  }
  if (status === 'learning') {
    return (
      <Box sx={{
        width: 16, height: 16, border: '1px solid',
        borderColor: 'primary.main', borderRadius: 0.5,
        bgcolor: theme => alpha(theme.palette.primary.main, 0.20),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.light' }} />
      </Box>
    )
  }
  return (
    <Box sx={{ width: 16, height: 16, border: '1px solid', borderColor: 'divider', borderRadius: 0.5 }} />
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <Chip
        label="完了"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(46,160,67,0.15)', border: '1px solid #238636', color: '#3fb950', borderRadius: 99 }}
      />
    )
  }
  if (status === 'learning') {
    return (
      <Chip
        label="学習中"
        size="small"
        sx={{ height: 20, fontSize: 10, bgcolor: theme => alpha(theme.palette.primary.main, 0.15), border: '1px solid', borderColor: theme => alpha(theme.palette.primary.main, 0.4), color: 'primary.light', borderRadius: 99 }}
      />
    )
  }
  return null
}
```

- [ ] **Step 3: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 4: コミットする**

```bash
git add src/features/reference/KnowledgeList.tsx
git rm src/features/reference/KnowledgeCard.tsx
git commit -m "feat: replace KnowledgeList cards with GitHub-style table rows"
```

---

## Task 7: ビルド確認と push

**Files:** なし（確認のみ）

- [ ] **Step 1: TypeScript 最終チェック**

```bash
npx tsc --noEmit
```

Expected: エラーゼロ

- [ ] **Step 2: Web版をビルドして確認する**

```bash
npm run build:web 2>&1 | tail -5
```

Expected: `✓ built in X.XXs`

- [ ] **Step 3: 全変更を push する**

```bash
git push origin main
```

Expected: GitHub Actions の `Deploy to GitHub Pages` が起動し、`https://tafukagawa.github.io/K8s-learn/` に新 UI が反映される。
