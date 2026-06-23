import { useEffect, useState, useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme } from './shared/theme'
import { Layout } from './shared/components/Layout'
import { Header } from './shared/components/Header'
import { Sidebar, type AppMode, type AppSection } from './shared/components/Sidebar'
import { SplashScreen } from './shared/components/SplashScreen'
import { ReferenceView } from './features/reference/ReferenceView'
import { FlashcardView } from './features/flashcard/FlashcardView'
import { api } from './shared/ipc'
import type { Category } from './types'

type FlashcardConfig = {
  section: 'commands' | 'knowledge' | 'all'
  filter: 'all' | 'unseen' | 'learning'
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [mode, setMode] = useState<AppMode>('reference')
  const [section, setSection] = useState<AppSection>('commands')
  const [searchQuery, setSearchQuery] = useState('')
  const [progressStats, setProgressStats] = useState({ done: 0, total: 0 })
  const [darkMode, setDarkMode] = useState(true)
  const [flashcardConfig, setFlashcardConfig] = useState<FlashcardConfig>({ section: 'all', filter: 'all' })
  const [splashVisible, setSplashVisible] = useState(true)
  const [splashExiting, setSplashExiting] = useState(false)

  function handleStartLearning(sec: 'commands' | 'knowledge') {
    setFlashcardConfig({ section: sec, filter: 'unseen' })
    setMode('flashcard')
  }

  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode])

  useEffect(() => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 1200))
    Promise.all([api.categories.list(), minDelay])
      .then(([cats]) => {
        setCategories(cats)
        if (cats.length > 0) setSelectedCategoryId(cats[0].id)
      })
      .finally(() => {
        setSplashExiting(true)
        setTimeout(() => setSplashVisible(false), 400)
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
      {splashVisible && <SplashScreen exiting={splashExiting} />}
      <Layout
        header={
          <Header
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(d => !d)}
            onLogoClick={() => setMode('reference')}
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
        {selectedCategoryId && mode === 'reference' && (
          <ReferenceView
            categoryId={selectedCategoryId}
            section={section}
            searchQuery={searchQuery}
            onStartLearning={handleStartLearning}
          />
        )}
        {selectedCategoryId && mode === 'flashcard' && (
          <FlashcardView
            categoryId={selectedCategoryId}
            initialSection={flashcardConfig.section}
            initialFilter={flashcardConfig.filter}
            onBack={() => setMode('reference')}
          />
        )}
      </Layout>
    </ThemeProvider>
  )
}
