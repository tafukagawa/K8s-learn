import Database from 'better-sqlite3'
import { applySchema } from '../../electron/db/migrate'
import { createProgressHandlers } from '../../electron/ipc/progress'
import { describe, it, expect, beforeEach } from 'vitest'

describe('progress handlers', () => {
  let db: Database.Database
  let handlers: ReturnType<typeof createProgressHandlers>

  beforeEach(() => {
    db = new Database(':memory:')
    applySchema(db)
    handlers = createProgressHandlers(db)
  })

  it('upsert creates a new progress record', () => {
    const result = handlers.upsert('command', 1, 'learning')
    expect(result.status).toBe('learning')
    expect(result.itemType).toBe('command')
    expect(result.itemId).toBe(1)
  })

  it('upsert updates an existing record', () => {
    handlers.upsert('command', 1, 'learning')
    const result = handlers.upsert('command', 1, 'done')
    expect(result.status).toBe('done')
  })
})
