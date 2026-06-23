import Database from 'better-sqlite3'
import type { Section } from '../../src/types'

export function createSectionHandlers(db: Database.Database) {
  return {
    list(categoryId: number): Section[] {
      const rows = db.prepare(
        'SELECT * FROM sections WHERE category_id = ? ORDER BY "order"'
      ).all(categoryId) as any[]
      return rows.map(row => ({
        id: row.id,
        categoryId: row.category_id,
        slug: row.slug,
        title: row.title,
        order: row.order,
      }))
    },
  }
}
