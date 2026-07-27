import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { openDb, upsertProgress, getProgress } from '../src/db'

function tmpDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-db-'))
  return path.join(dir, 'progress.db')
}

describe('progress store', () => {
  let dbPath: string
  let db: ReturnType<typeof openDb>

  afterEach(() => {
    db?.close()
    if (dbPath) fs.rmSync(path.dirname(dbPath), { recursive: true, force: true })
  })

  it('returns null for a record that was never written', () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    expect(getProgress(db, 'command', 999)).toBeNull()
  })

  it('upserts and then reads back a progress record', () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)

    const created = upsertProgress(db, 'command', 1, 'learning')
    expect(created.status).toBe('learning')
    expect(created.itemType).toBe('command')
    expect(created.itemId).toBe(1)

    const updated = upsertProgress(db, 'command', 1, 'done')
    expect(updated.status).toBe('done')

    const fetched = getProgress(db, 'command', 1)
    expect(fetched?.status).toBe('done')
  })
})
