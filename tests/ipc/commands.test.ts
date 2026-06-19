import Database from 'better-sqlite3'
import { applySchema } from '../../electron/db/migrate'
import { createCommandHandlers } from '../../electron/ipc/commands'
import { describe, it, expect, beforeEach } from 'vitest'

describe('command handlers', () => {
  let db: Database.Database
  let handlers: ReturnType<typeof createCommandHandlers>
  let categoryId: number

  beforeEach(() => {
    db = new Database(':memory:')
    applySchema(db)
    categoryId = db
      .prepare("INSERT INTO categories (slug, name) VALUES ('k8s', 'Kubernetes') RETURNING id")
      .get()!.id as number
    handlers = createCommandHandlers(db)
  })

  it('list returns empty array for new category', () => {
    expect(handlers.list(categoryId)).toEqual([])
  })

  it('create then list returns the created command', () => {
    handlers.create({ categoryId, name: 'kubectl get pods', description: 'Pod一覧', syntax: '', example: '', tags: ['pod'] })
    const results = handlers.list(categoryId)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('kubectl get pods')
    expect(results[0].tags).toEqual(['pod'])
    expect(results[0].isCustom).toBe(true)
  })

  it('update changes the specified fields', () => {
    const created = handlers.create({ categoryId, name: 'kubectl get pods', description: 'old', syntax: '', example: '', tags: [] })
    handlers.update(created.id, { description: 'new' })
    const results = handlers.list(categoryId)
    expect(results[0].description).toBe('new')
  })

  it('delete removes the command', () => {
    const created = handlers.create({ categoryId, name: 'kubectl get pods', description: '', syntax: '', example: '', tags: [] })
    handlers.delete(created.id)
    expect(handlers.list(categoryId)).toHaveLength(0)
  })
})
