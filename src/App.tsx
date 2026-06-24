import { useEffect, useState, useMemo, useRef } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './shared/theme'
import { Layout } from './shared/components/Layout'
import { Header } from './shared/components/Header'
import { Sidebar, type AppView } from './shared/components/Sidebar'
import { SplashScreen } from './shared/components/SplashScreen'
import { ReferenceView } from './features/reference/ReferenceView'
import { FlashcardView } from './features/flashcard/FlashcardView'
import { RoadmapView } from './features/roadmap/RoadmapView'
import { HelpView } from './features/help/HelpView'
import { SettingsDialog } from './features/settings/SettingsDialog'
import { api } from './shared/ipc'
import type { Category } from './types'

type FlashcardConfig = {
  section: 'commands' | 'knowledge' | 'all'
  filter: 'all' | 'unseen' | 'learning'
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [view, setView] = useState<AppView>({ mode: 'flashcard' })
  const [searchQuery, setSearchQuery] = useState('')
  const [progressStats, setProgressStats] = useState({ done: 0, total: 0 })
  const [darkMode, setDarkMode] = useState(true)
  const [flashcardConfig, setFlashcardConfig] = useState<FlashcardConfig>({ section: 'all', filter: 'all' })
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashExiting, setSplashExiting] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const lastRefView = useRef<Extract<AppView, { mode: 'reference' }> | null>(null)

  function handleStartLearning(contentType: 'commands' | 'knowledge') {
    setFlashcardConfig({ section: contentType, filter: 'unseen' })
    setView({ mode: 'flashcard' })
  }

  async function handleSelectCategory(categoryId: number) {
    const sections = await api.sections.list(categoryId)
    if (sections.length > 0) {
      setView({ mode: 'reference', categoryId, sectionId: sections[0].id })
    }
  }

  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode])

  // Track last reference view for flashcard back navigation
  useEffect(() => {
    if (view.mode === 'reference') {
      lastRefView.current = view
    }
  }, [view])

  useEffect(() => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 1200))
    Promise.all([api.categories.list(), minDelay])
      .then(([cats]) => {
        setCategories(cats)
      })
      .finally(() => {
        setSplashExiting(true)
        setTimeout(() => setSplashVisible(false), 400)
      })
  }, [])

  // Update progress stats when active category changes
  const activeCategoryId = view.mode === 'reference' ? view.categoryId : (lastRefView.current?.categoryId ?? null)
  useEffect(() => {
    if (!activeCategoryId) return
    Promise.all([
      api.commands.list(activeCategoryId),
      api.knowledge.list(activeCategoryId),
    ]).then(([commands, knowledge]) => {
      const all = [...commands, ...knowledge]
      setProgressStats({
        done: all.filter(i => i.progress?.status === 'done').length,
        total: all.length,
      })
    })
  }, [activeCategoryId])

  const flashcardCategoryId = lastRefView.current?.categoryId ?? categories[0]?.id

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {splashVisible && <SplashScreen exiting={splashExiting} />}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Layout
        header={
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        }
        sidebar={
          <Sidebar
            categories={categories}
            view={view}
            onViewChange={setView}
            doneCount={progressStats.done}
            totalCount={progressStats.total}
          />
        }
      >
        {view.mode === 'reference' && (
          <ReferenceView
            categoryId={view.categoryId}
            sectionId={view.sectionId}
            searchQuery={searchQuery}
            onStartLearning={handleStartLearning}
          />
        )}
        {view.mode === 'roadmap' && (
          <RoadmapView categories={categories} onSelectCategory={handleSelectCategory} />
        )}
        {view.mode === 'help' && <HelpView />}
        {view.mode === 'flashcard' && flashcardCategoryId != null && (
          <FlashcardView
            categoryId={flashcardCategoryId}
            initialSection={flashcardConfig.section}
            initialFilter={flashcardConfig.filter}
            onBack={() => {
              if (lastRefView.current) setView(lastRefView.current)
            }}
          />
        )}
      </Layout>
    </ThemeProvider>
  )
}
