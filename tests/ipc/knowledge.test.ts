import Database from 'better-sqlite3'
import { applySchema } from '../../electron/db/migrate'
import { createKnowledgeHandlers } from '../../electron/ipc/knowledge'
import { describe, it, expect, beforeEach } from 'vitest'

describe('knowledge handlers', () => {
  let db: Database.Database
  let handlers: ReturnType<typeof createKnowledgeHandlers>
  let categoryId: number

  beforeEach(() => {
    db = new Database(':memory:')
    applySchema(db)
    categoryId = db
      .prepare("INSERT INTO categories (slug, name) VALUES ('k8s', 'Kubernetes') RETURNING id")
      .get()!.id as number
    handlers = createKnowledgeHandlers(db)
  })

  it('list returns empty array for new category', () => {
    expect(handlers.list(categoryId)).toEqual([])
  })

  it('create then list returns the created knowledge item', () => {
    handlers.create({ categoryId, title: 'Pod とは', body: '最小デプロイ単位', tags: ['pod'] })
    const results = handlers.list(categoryId)
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Pod とは')
    expect(results[0].tags).toEqual(['pod'])
  })
})
