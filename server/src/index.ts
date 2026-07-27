import path from 'node:path'
import { createApp } from './app'
import { openDb } from './db'

const PORT = Number(process.env.PORT ?? 3000)
const CATEGORIES_DIR = process.env.CATEGORIES_DIR ?? path.join(__dirname, '..', 'categories')
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'progress.db')

const db = openDb(DB_PATH)
const app = createApp(CATEGORIES_DIR, db)

app.listen(PORT, () => {
  console.log(`k8s-learning-app-api listening on port ${PORT}`)
})
