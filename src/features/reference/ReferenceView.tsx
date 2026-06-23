import { Box } from '@mui/material'
import { CommandList } from './CommandList'
import { KnowledgeList } from './KnowledgeList'
import type { AppSection } from '../../shared/components/Sidebar'

interface ReferenceViewProps {
  categoryId: number
  section: AppSection
  searchQuery: string
  onStartLearning: (section: 'commands' | 'knowledge') => void
}

export function ReferenceView({ categoryId, section, searchQuery, onStartLearning }: ReferenceViewProps) {
  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      {section === 'commands' && (
        <CommandList categoryId={categoryId} searchQuery={searchQuery} onStartLearning={() => onStartLearning('commands')} />
      )}
      {section === 'knowledge' && (
        <KnowledgeList categoryId={categoryId} searchQuery={searchQuery} onStartLearning={() => onStartLearning('knowledge')} />
      )}
    </Box>
  )
}
