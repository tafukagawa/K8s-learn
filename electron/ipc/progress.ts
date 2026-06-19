import Database from 'better-sqlite3'
import type { Progress, ProgressStatus } from '../../src/types'

export function createProgressHandlers(db: Database.Database) {
  return {
    upsert(itemType: 'command' | 'knowledge', itemId: number, status: ProgressStatus): Progress {
      const now = new Date().toISOString()
      const row = db.prepare(`
        INSERT INTO progress (item_type, item_id, status, last_reviewed)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(item_type, item_id) DO UPDATE SET
          status = excluded.status,
          last_reviewed = excluded.last_reviewed
        RETURNING *
      `).get(itemType, itemId, status, now) as any
      return {
        id: row.id,
        itemType: row.item_type,
        itemId: row.item_id,
        status: row.status,
        correctCount: row.correct_count,
        attemptCount: row.attempt_count,
        lastReviewed: row.last_reviewed,
      }
    },
  }
}
