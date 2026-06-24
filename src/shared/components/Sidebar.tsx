import { useState, useEffect } from 'react'
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, LinearProgress, Collapse,
} from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import {
  StackIcon, ProjectRoadmapIcon, QuestionIcon,
  ChevronDownIcon, ChevronRightIcon,
} from '@primer/octicons-react'
import { alpha } from '@mui/material/styles'
import {
  DndContext, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

interface SortableCategoryRowProps {
  cat: Category
  sections: Section[]
  isOpen: boolean
  view: AppView
  onToggle: () => void
  onViewChange: (view: AppView) => void
}

function SortableCategoryRow({ cat, sections, isOpen, view, onToggle, onViewChange }: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const isRefView = view.mode === 'reference'

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <ListItemButton
        onClick={onToggle}
        sx={{ borderRadius: 1, py: 0.6, px: 1, mb: 0.25, pr: 0.5, '&:hover .drag-handle': { opacity: 1 } }}
      >
        <Box
          className="drag-handle"
          onClick={e => e.stopPropagation()}
          sx={{ opacity: 0, cursor: 'grab', color: 'text.disabled', display: 'flex', mr: 0.25, flexShrink: 0, '&:active': { cursor: 'grabbing' } }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon sx={{ fontSize: 14 }} />
        </Box>
        <ListItemIcon sx={{ minWidth: 20 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            {isOpen ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={cat.name}
          slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }}
        />
      </ListItemButton>
      <Collapse in={isOpen} unmountOnExit>
        {sections.map(sec => {
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
}

export function Sidebar({ categories, view, onViewChange, doneCount, totalCount }: SidebarProps) {
  const [sections, setSections] = useState<Record<number, Section[]>>({})
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set())
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)

  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = localCategories.findIndex(c => c.id === active.id)
    const newIndex = localCategories.findIndex(c => c.id === over.id)
    const reordered = arrayMove(localCategories, oldIndex, newIndex)
    setLocalCategories(reordered)
    api.categories.reorder(reordered.map(c => c.slug))
  }

  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <Box sx={{
      width: 252,
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      p: 1.5,
      flexShrink: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
    }}>

      {/* 学習ツール */}
      <Box>
        <Typography variant="caption" sx={labelSx}>学習ツール</Typography>
        <List dense disablePadding>
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
                <ProjectRoadmapIcon size={14} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary="ロードマップ"
              slotProps={{ primary: { sx: { fontSize: 13, fontWeight: view.mode === 'roadmap' ? 600 : 400, color: view.mode === 'roadmap' ? 'primary.light' : 'text.primary' } } }}
            />
          </ListItemButton>

          {/* 学習進捗ウィジェット */}
          <Box sx={{
            mx: 1, mb: 0.5, p: 1.25,
            bgcolor: 'background.default',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}>
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
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {localCategories.map(cat => (
                <SortableCategoryRow
                  key={cat.id}
                  cat={cat}
                  sections={sections[cat.id] ?? []}
                  isOpen={expandedCats.has(cat.id)}
                  view={view}
                  onToggle={() => toggleCat(cat)}
                  onViewChange={onViewChange}
                />
              ))}
            </SortableContext>
          </DndContext>
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
