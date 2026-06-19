import Database from 'better-sqlite3'
import { applySchema } from '../../electron/db/migrate'
import { describe, it, expect, beforeEach } from 'vitest'

describe('applySchema', () => {
  let db: Database.Database

  beforeEach(() => {
    db = new Database(':memory:')
  })

  it('creates all required tables', () => {
    applySchema(db)
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((r: any) => r.name)
    expect(tables).toContain('categories')
    expect(tables).toContain('commands')
    expect(tables).toContain('knowledge')
    expect(tables).toContain('progress')
    expect(tables).toContain('roadmap_steps')
  })

  it('is idempotent — running twice does not throw', () => {
    expect(() => {
      applySchema(db)
      applySchema(db)
    }).not.toThrow()
  })
})
