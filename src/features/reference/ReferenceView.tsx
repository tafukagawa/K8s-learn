import { Box } from '@mui/material'
import { CommandList } from './CommandList'
import { KnowledgeList } from './KnowledgeList'
import type { AppSection } from '../../shared/components/Sidebar'

interface ReferenceViewProps {
  categoryId: number
  section: AppSection
  searchQuery: string
}

export function ReferenceView({ categoryId, section, searchQuery }: ReferenceViewProps) {
  return (
    <Box sx={{ p: 2.5 }}>
      {section === 'commands' && (
        <CommandList categoryId={categoryId} searchQuery={searchQuery} />
      )}
      {section === 'knowledge' && (
        <KnowledgeList categoryId={categoryId} searchQuery={searchQuery} />
      )}
    </Box>
  )
}
