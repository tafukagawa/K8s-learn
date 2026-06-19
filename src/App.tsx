import { useEffect, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './shared/theme'
import { Layout } from './shared/components/Layout'
import { Header } from './shared/components/Header'
import { Sidebar, type AppMode, type AppSection } from './shared/components/Sidebar'
import { ReferenceView } from './features/reference/ReferenceView'
import { api } from './shared/ipc'
import type { Category } from './types'

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [mode, setMode] = useState<AppMode>('reference')
  const [section, setSection] = useState<AppSection>('commands')
  const [searchQuery, setSearchQuery] = useState('')
  const [progressStats, setProgressStats] = useState({ done: 0, total: 0 })

  useEffect(() => {
    api.categories.list().then(cats => {
      setCategories(cats)
      if (cats.length > 0) setSelectedCategoryId(cats[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) return
    Promise.all([
      api.commands.list(selectedCategoryId),
      api.knowledge.list(selectedCategoryId),
    ]).then(([commands, knowledge]) => {
      const all = [...commands, ...knowledge]
      setProgressStats({
        done: all.filter(i => i.progress?.status === 'done').length,
        total: all.length,
      })
    })
  }, [selectedCategoryId])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout
        header={
          <Header
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        }
        sidebar={
          <Sidebar
            mode={mode}
            section={section}
            onModeChange={setMode}
            onSectionChange={setSection}
            doneCount={progressStats.done}
            totalCount={progressStats.total}
          />
        }
      >
        {selectedCategoryId && (
          <ReferenceView
            categoryId={selectedCategoryId}
            section={section}
            searchQuery={searchQuery}
          />
        )}
      </Layout>
    </ThemeProvider>
  )
}
