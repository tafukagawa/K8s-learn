import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Grid2 as Grid } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { CommandCard } from './CommandCard'
import { TagFilter } from './TagFilter'
import { CommandDetail } from './CommandDetail'
import { CommandForm } from './CommandForm'
import { api } from '../../shared/ipc'
import type { CommandWithProgress, ProgressStatus } from '../../types'

interface CommandListProps {
  categoryId: number
  searchQuery: string
}

export function CommandList({ categoryId, searchQuery }: CommandListProps) {
  const [commands, setCommands] = useState<CommandWithProgress[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [detailCommand, setDetailCommand] = useState<CommandWithProgress | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<CommandWithProgress | null>(null)

  useEffect(() => {
    api.commands.list(categoryId).then(setCommands)
  }, [categoryId])

  const allTags = useMemo(() => {
    const tags = new Set(commands.flatMap(c => c.tags))
    return [...tags].sort()
  }, [commands])

  const filtered = useMemo(() => commands.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = selectedTag === null || c.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  }), [commands, searchQuery, selectedTag])

  async function handleProgressChange(command: CommandWithProgress, status: ProgressStatus) {
    const updated = await api.progress.upsert('command', command.id, status)
    setCommands(prev => prev.map(c => c.id === command.id ? { ...c, progress: updated } : c))
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Kubernetes Commands</Typography>
          <Typography variant="caption" color="text.secondary">
            {commands.length} コマンド · {commands.filter(c => c.progress?.status === 'done').length} 完了
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { setEditingCommand(null); setFormOpen(true) }}>
          追加
        </Button>
      </Box>

      <TagFilter allTags={allTags} selectedTag={selectedTag} onTagChange={setSelectedTag} />

      <Grid container spacing={1.5}>
        {filtered.map(cmd => (
          <Grid key={cmd.id} size={6}>
            <CommandCard
              command={cmd}
              onClick={() => setDetailCommand(cmd)}
              onProgressChange={status => handleProgressChange(cmd, status)}
            />
          </Grid>
        ))}
      </Grid>

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
        onClose={() => { setFormOpen(false); setEditingCommand(null) }}
        onSuccess={handleFormSuccess}
      />
    </Box>
  )
}
