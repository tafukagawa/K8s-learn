import { useState, useEffect } from 'react'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, LinearProgress, Collapse,
} from '@mui/material'
import StyleIcon from '@mui/icons-material/Style'
import RouteIcon from '@mui/icons-material/Route'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
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
      bgcolor: theme.palette.mode === 'dark' ? '#111111' : '#ffffff',
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
              borderRadius: 1, mb: 0.5, px: 1, minHeight: 40,
              border: '1px solid',
              bgcolor: view.mode === 'flashcard' ? (theme.palette.mode === 'dark' ? '#2A4A78' : alpha(theme.palette.primary.main, 0.12)) : undefined,
              borderColor: view.mode === 'flashcard' ? alpha(theme.palette.primary.main, 0.5) : 'transparent',
            })}
          >
            <ListItemIcon sx={{ minWidth: 30, color: view.mode === 'flashcard' ? 'primary.light' : 'text.secondary' }}>
              <StyleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="フラッシュカード" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'flashcard' ? 800 : 600 } } }} />
          </ListItemButton>

          {/* ロードマップ */}
          <ListItemButton
            selected={view.mode === 'roadmap'}
            onClick={() => onViewChange({ mode: 'roadmap' })}
            sx={theme => ({
              borderRadius: 1, mb: 0.25, px: 1, minHeight: 40,
              border: '1px solid',
              bgcolor: view.mode === 'roadmap' ? (theme.palette.mode === 'dark' ? '#2A4A78' : alpha(theme.palette.primary.main, 0.12)) : undefined,
              borderColor: view.mode === 'roadmap' ? alpha(theme.palette.primary.main, 0.5) : 'transparent',
            })}
          >
            <ListItemIcon sx={{ minWidth: 30, color: view.mode === 'roadmap' ? 'primary.light' : 'text.secondary' }}>
              <RouteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="ロードマップ" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'roadmap' ? 800 : 600 } } }} />
          </ListItemButton>

          {/* 学習進捗（ロードマップ配下・常時表示） */}
          <Box sx={theme => ({
            mx: 1, mb: 0.5, p: 1.25,
            bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#f4f8ff',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          })}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'text.secondary', mb: 0.75 }}>学習進捗</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
              <Box sx={theme => ({
                width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: '50%',
                background: `conic-gradient(${theme.palette.primary.main} ${progress}%, rgba(148,163,184,0.14) 0)`,
                position: 'relative', flexShrink: 0,
                '&::after': { content: '""', position: 'absolute', inset: 6, borderRadius: '50%', bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#f4f8ff' },
              })}>
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 900, lineHeight: 1 }}>{doneCount}</Typography>
                  <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>/{totalCount}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{Math.round(progress)}% 完了</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>あと {Math.max(0, totalCount - doneCount)} 件</Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 3, borderRadius: 1, bgcolor: 'rgba(148,163,184,0.14)', '& .MuiLinearProgress-bar': { borderRadius: 1 } }} />
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
                  <ListItemIcon sx={{ minWidth: 22 }}>
                    {isCatOpen
                      ? <ExpandMoreIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      : <ChevronRightIcon sx={{ fontSize: 15, color: 'text.secondary' }} />}
                  </ListItemIcon>
                  <ListItemText primary={cat.name} slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 700 } } }} />
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
                          bgcolor: sel ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.08)) : undefined,
                        })}
                      >
                        <ListItemText primary={sec.title} slotProps={{ primary: { sx: { fontSize: 12, fontWeight: sel ? 800 : 500 } } }} />
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
            border: '1px solid',
            bgcolor: view.mode === 'help' ? (theme.palette.mode === 'dark' ? '#2A4A78' : alpha(theme.palette.primary.main, 0.12)) : undefined,
            borderColor: view.mode === 'help' ? alpha(theme.palette.primary.main, 0.5) : 'transparent',
          })}
        >
          <ListItemIcon sx={{ minWidth: 30, color: view.mode === 'help' ? 'primary.light' : 'text.secondary' }}>
            <HelpOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ヘルプ" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'help' ? 800 : 600 } } }} />
        </ListItemButton>
      </Box>
    </Box>
  )
}

const labelSx = {
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  mb: 0.75,
  display: 'block',
  fontWeight: 800,
  fontSize: '0.65rem',
}
