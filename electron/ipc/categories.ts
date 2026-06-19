import Database from 'better-sqlite3'
import type { Category } from '../../src/types'

export function createCategoryHandlers(db: Database.Database) {
  return {
    list(): Category[] {
      return (db.prepare('SELECT * FROM categories ORDER BY "order", id').all() as any[]).map(row => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        icon: row.icon,
        order: row.order,
      }))
    },
  }
}
