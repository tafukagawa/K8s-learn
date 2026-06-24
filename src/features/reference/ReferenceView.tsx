import { useState, useEffect } from 'react'
import { Box, Tabs, Tab, Typography } from '@mui/material'
import TerminalIcon from '@mui/icons-material/Terminal'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { CommandList } from './CommandList'
import { KnowledgeList } from './KnowledgeList'
import { AutoplayCarousel } from './AutoplayCarousel'
import { api } from '../../shared/ipc'
import { SECTION_URLS } from '../../data/sectionUrls'

interface ReferenceViewProps {
  categoryId: number
  sectionId: number
  searchQuery: string
  onStartLearning: (contentType: 'commands' | 'knowledge') => void
}

export function ReferenceView({ categoryId, sectionId, searchQuery, onStartLearning }: ReferenceViewProps) {
  const [tab, setTab] = useState<'commands' | 'knowledge'>('knowledge')
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    Promise.all([
      api.categories.list(),
      api.sections.list(categoryId),
    ]).then(([cats, sections]) => {
      const cat = cats.find(c => c.id === categoryId)
      const sec = sections.find(s => s.id === sectionId)
      if (cat && sec) {
        setCategoryName(cat.name)
        setDocUrl(SECTION_URLS[cat.slug]?.[sec.slug] ?? null)
      }
    })
  }, [categoryId, sectionId])

  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      <AutoplayCarousel categoryId={categoryId} sectionId={sectionId} />
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
          categoryName={categoryName}
          onStartLearning={() => onStartLearning('commands')}
        />
      )}
      {tab === 'knowledge' && (
        <KnowledgeList
          categoryId={categoryId}
          sectionId={sectionId}
          searchQuery={searchQuery}
          categoryName={categoryName}
          onStartLearning={() => onStartLearning('knowledge')}
        />
      )}

      {docUrl && (
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>公式ドキュメント:</Typography>
          <Box
            component="a"
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: 12, color: 'primary.main', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.25, '&:hover': { textDecoration: 'underline' } }}
          >
            {docUrl}
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
