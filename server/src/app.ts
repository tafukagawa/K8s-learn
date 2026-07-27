import express, { type Express } from 'express'
import type Database from 'better-sqlite3'
import { buildData } from './data'
import { getProgress, upsertProgress } from './db'
import type { ProgressStatus } from './types'

const VALID_ITEM_TYPES = ['command', 'knowledge'] as const
const VALID_STATUSES: ProgressStatus[] = ['unseen', 'learning', 'done']

export function createApp(categoriesDir: string, db: Database.Database): Express {
  const app = express()
  app.use(express.json())

  const dataset = buildData(categoriesDir)

  app.get('/healthz', (_req, res) => {
    res.status(200).send('ok')
  })

  app.get('/api/categories', (_req, res) => {
    res.json(dataset.categories)
  })

  app.get('/api/categories/:categoryId/sections', (req, res) => {
    const categoryId = Number(req.params.categoryId)
    res.json(dataset.sections.filter((s) => s.categoryId === categoryId))
  })

  app.get('/api/categories/:categoryId/commands', (req, res) => {
    const categoryId = Number(req.params.categoryId)
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : undefined
    const items = dataset.commands.filter(
      (c) => c.categoryId === categoryId && (sectionId === undefined || c.sectionId === sectionId)
    )
    res.json(items.map((c) => ({ ...c, progress: getProgress(db, 'command', c.id) })))
  })

  app.get('/api/categories/:categoryId/knowledge', (req, res) => {
    const categoryId = Number(req.params.categoryId)
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : undefined
    const items = dataset.knowledge.filter(
      (k) => k.categoryId === categoryId && (sectionId === undefined || k.sectionId === sectionId)
    )
    res.json(items.map((k) => ({ ...k, progress: getProgress(db, 'knowledge', k.id) })))
  })

  app.put('/api/progress', (req, res) => {
    const { itemType, itemId, status } = req.body ?? {}

    if (!VALID_ITEM_TYPES.includes(itemType)) {
      res.status(400).json({ error: `itemType must be one of ${VALID_ITEM_TYPES.join(', ')}` })
      return
    }
    if (typeof itemId !== 'number') {
      res.status(400).json({ error: 'itemId must be a number' })
      return
    }
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` })
      return
    }

    res.json(upsertProgress(db, itemType, itemId, status))
  })

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'internal server error' })
  })

  return app
}
