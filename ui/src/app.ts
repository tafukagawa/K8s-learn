import express, { type Express } from 'express'
import path from 'node:path'
import { fetchCategories, fetchCommands } from './apiClient'

export function createApp(apiBaseUrl: string): Express {
  const app = express()
  app.set('view engine', 'ejs')
  app.set('views', path.join(__dirname, '..', 'views'))

  app.get('/healthz', (_req, res) => {
    res.status(200).send('ok')
  })

  app.get('/', async (_req, res) => {
    try {
      const categories = await fetchCategories(apiBaseUrl)
      res.render('categories', { categories, error: null })
    } catch (err) {
      console.error(err)
      res.render('categories', { categories: [], error: 'データを取得できませんでした' })
    }
  })

  app.get('/categories/:id/commands', async (req, res) => {
    const categoryId = Number(req.params.id)
    try {
      const commands = await fetchCommands(apiBaseUrl, categoryId)
      res.render('commands', { commands, categoryId, error: null })
    } catch (err) {
      console.error(err)
      res.render('commands', { commands: [], categoryId, error: 'データを取得できませんでした' })
    }
  })

  return app
}
