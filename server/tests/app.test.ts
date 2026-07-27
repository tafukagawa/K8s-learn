import { describe, it, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import request from 'supertest'
import { createApp } from '../src/app'
import { openDb } from '../src/db'

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'categories')

function tmpDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-app-'))
  return path.join(dir, 'progress.db')
}

describe('app', () => {
  let dbPath: string
  let db: ReturnType<typeof openDb>

  afterEach(() => {
    db?.close()
    if (dbPath) fs.rmSync(path.dirname(dbPath), { recursive: true, force: true })
  })

  it('GET /healthz returns 200', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)
    const res = await request(app).get('/healthz')
    expect(res.status).toBe(200)
  })

  it('GET /api/categories returns the loaded categories', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: 1, slug: 'demo', name: 'Demo', icon: '', order: 0 }])
  })

  it('GET /api/categories/:id/commands includes progress: null when unset', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)
    const res = await request(app).get('/api/categories/1/commands')
    expect(res.status).toBe(200)
    expect(res.body[0].name).toBe('echo hi')
    expect(res.body[0].progress).toBeNull()
  })

  it('PUT /api/progress upserts a valid record and it shows up on the next GET', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)

    const putRes = await request(app)
      .put('/api/progress')
      .send({ itemType: 'command', itemId: 1, status: 'learning' })
    expect(putRes.status).toBe(200)
    expect(putRes.body.status).toBe('learning')

    const getRes = await request(app).get('/api/categories/1/commands')
    expect(getRes.body[0].progress.status).toBe('learning')
  })

  it('PUT /api/progress rejects an invalid status with 400', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)
    const res = await request(app)
      .put('/api/progress')
      .send({ itemType: 'command', itemId: 1, status: 'bogus' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/status/)
  })

  it('PUT /api/progress rejects an invalid itemType with 400', async () => {
    dbPath = tmpDbPath()
    db = openDb(dbPath)
    const app = createApp(FIXTURE_DIR, db)
    const res = await request(app)
      .put('/api/progress')
      .send({ itemType: 'bogus', itemId: 1, status: 'done' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/itemType/)
  })
})
