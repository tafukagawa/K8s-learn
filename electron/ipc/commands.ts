import Database from 'better-sqlite3'
import type { Command, CommandWithProgress } from '../../src/types'

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function rowToCommand(row: any): Command {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    syntax: row.syntax,
    example: row.example,
    tags: parseTags(row.tags),
    isCustom: row.is_custom === 1,
    url: row.url ?? '',
  }
}

export function createCommandHandlers(db: Database.Database) {
  return {
    list(categoryId: number): CommandWithProgress[] {
      const rows = db.prepare(`
        SELECT c.*, p.status, p.correct_count, p.attempt_count, p.last_reviewed
        FROM commands c
        LEFT JOIN progress p ON p.item_type = 'command' AND p.item_id = c.id
        WHERE c.category_id = ?
        ORDER BY c.id
      `).all(categoryId)
      return rows.map((row: any) => ({
        ...rowToCommand(row),
        progress: row.status ? {
          id: row.id,
          itemType: 'command' as const,
          itemId: row.id,
          status: row.status,
          correctCount: row.correct_count,
          attemptCount: row.attempt_count,
          lastReviewed: row.last_reviewed,
        } : null,
      }))
    },

    create(data: Omit<Command, 'id' | 'isCustom'>): Command {
      const row = db.prepare(`
        INSERT INTO commands (category_id, name, description, syntax, example, tags, url, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        RETURNING *
      `).get(data.categoryId, data.name, data.description, data.syntax, data.example, JSON.stringify(data.tags), data.url ?? '') as any
      return rowToCommand(row)
    },

    update(id: number, data: Partial<Omit<Command, 'id'>>): Command {
      const fields: string[] = []
      const values: any[] = []
      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
      if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
      if (data.syntax !== undefined) { fields.push('syntax = ?'); values.push(data.syntax) }
      if (data.example !== undefined) { fields.push('example = ?'); values.push(data.example) }
      if (data.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(data.tags)) }
      if (data.url !== undefined) { fields.push('url = ?'); values.push(data.url) }
      values.push(id)
      const row = db.prepare(`UPDATE commands SET ${fields.join(', ')} WHERE id = ? RETURNING *`).get(...values) as any
      return rowToCommand(row)
    },

    delete(id: number): void {
      db.prepare('DELETE FROM commands WHERE id = ?').run(id)
    },
  }
}
