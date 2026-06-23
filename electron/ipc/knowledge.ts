import Database from 'better-sqlite3'
import type { Knowledge, KnowledgeWithProgress } from '../../src/types'

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function rowToKnowledge(row: any): Knowledge {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    body: row.body,
    tags: parseTags(row.tags),
    isCustom: row.is_custom === 1,
    url: row.url ?? '',
  }
}

export function createKnowledgeHandlers(db: Database.Database) {
  return {
    list(categoryId: number): KnowledgeWithProgress[] {
      const rows = db.prepare(`
        SELECT k.*, p.status, p.correct_count, p.attempt_count, p.last_reviewed
        FROM knowledge k
        LEFT JOIN progress p ON p.item_type = 'knowledge' AND p.item_id = k.id
        WHERE k.category_id = ?
        ORDER BY k.id
      `).all(categoryId)
      return rows.map((row: any) => ({
        ...rowToKnowledge(row),
        progress: row.status ? {
          id: row.id,
          itemType: 'knowledge' as const,
          itemId: row.id,
          status: row.status,
          correctCount: row.correct_count,
          attemptCount: row.attempt_count,
          lastReviewed: row.last_reviewed,
        } : null,
      }))
    },

    create(data: Omit<Knowledge, 'id' | 'isCustom'>): Knowledge {
      const row = db.prepare(`
        INSERT INTO knowledge (category_id, title, body, tags, url, is_custom)
        VALUES (?, ?, ?, ?, ?, 1)
        RETURNING *
      `).get(data.categoryId, data.title, data.body, JSON.stringify(data.tags), data.url ?? '') as any
      return rowToKnowledge(row)
    },

    update(id: number, data: Partial<Omit<Knowledge, 'id'>>): Knowledge {
      const fields: string[] = []
      const values: any[] = []
      if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
      if (data.body !== undefined) { fields.push('body = ?'); values.push(data.body) }
      if (data.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(data.tags)) }
      if (data.url !== undefined) { fields.push('url = ?'); values.push(data.url) }
      values.push(id)
      const row = db.prepare(`UPDATE knowledge SET ${fields.join(', ')} WHERE id = ? RETURNING *`).get(...values) as any
      return rowToKnowledge(row)
    },

    delete(id: number): void {
      db.prepare('DELETE FROM knowledge WHERE id = ?').run(id)
    },
  }
}
