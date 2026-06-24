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
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab
          value="knowledge"
          label="ナレッジ"
          icon={<LightbulbIcon fontSize="small" />}
          iconPosition="start"
          sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
        />
        <Tab
          value="commands"
          label="コマンド"
          icon={<TerminalIcon fontSize="small" />}
          iconPosition="start"
          sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
        />
      </Tabs>

      {tab === 'commands' && (
        <CommandList
          categoryId={categoryId}
          sectionId={sectionId}
          searchQuery={searchQuery}
          onStartLearning={() => onStartLearning('commands')}
        />
      )}
      {tab === 'knowledge' && (
        <KnowledgeList
          categoryId={categoryId}
          sectionId={sectionId}
          searchQuery={searchQuery}
          onStartLearning={() => onStartLearning('knowledge')}
        />
      )}
    </Box>
  )
}
