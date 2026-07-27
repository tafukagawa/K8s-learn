import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import type { Progress, ProgressStatus } from './types'

export function openDb(dbPath: string): Database.Database {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      last_reviewed TEXT NOT NULL,
      PRIMARY KEY (item_type, item_id)
    )
  `)
  return db
}

interface ProgressRow {
  item_type: 'command' | 'knowledge'
  item_id: number
  status: ProgressStatus
  last_reviewed: string
}

function rowToProgress(row: ProgressRow): Progress {
  return {
    id: row.item_id,
    itemType: row.item_type,
    itemId: row.item_id,
    status: row.status,
    correctCount: 0,
    attemptCount: 0,
    lastReviewed: row.last_reviewed,
  }
}

export function getProgress(
  db: Database.Database,
  itemType: 'command' | 'knowledge',
  itemId: number
): Progress | null {
  const row = db
    .prepare('SELECT * FROM progress WHERE item_type = ? AND item_id = ?')
    .get(itemType, itemId) as ProgressRow | undefined
  return row ? rowToProgress(row) : null
}

export function upsertProgress(
  db: Database.Database,
  itemType: 'command' | 'knowledge',
  itemId: number,
  status: ProgressStatus
): Progress {
  const lastReviewed = new Date().toISOString()
  db.prepare(`
    INSERT INTO progress (item_type, item_id, status, last_reviewed)
    VALUES (@itemType, @itemId, @status, @lastReviewed)
    ON CONFLICT(item_type, item_id) DO UPDATE SET status = @status, last_reviewed = @lastReviewed
  `).run({ itemType, itemId, status, lastReviewed })
  return getProgress(db, itemType, itemId)!
}
