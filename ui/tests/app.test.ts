import { describe, it, expect, vi, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ui app', () => {
  it('GET /healthz returns 200', async () => {
    const app = createApp('http://api.test')
    const res = await request(app).get('/healthz')
    expect(res.status).toBe(200)
  })

  it('GET / renders categories from the API with links to their commands page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, slug: 'demo', name: 'Demo', icon: '', order: 0 }],
    }))
    const app = createApp('http://api.test')
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Demo')
    expect(res.text).toContain('/categories/1/commands')
  })

  it('GET / shows an error message when the API call fails, without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const app = createApp('http://api.test')
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('データを取得できませんでした')
  })

  it('GET /categories/:id/commands renders commands with their progress status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: 1, categoryId: 1, sectionId: 1, name: 'echo hi', description: 'prints hi',
        syntax: 'echo hi', example: 'echo hi', tags: [], isCustom: false, url: '',
        progress: { status: 'learning' },
      }],
    }))
    const app = createApp('http://api.test')
    const res = await request(app).get('/categories/1/commands')
    expect(res.status).toBe(200)
    expect(res.text).toContain('echo hi')
    expect(res.text).toContain('learning')
  })

  it('GET /categories/:id/commands shows "unseen" when progress is null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: 2, categoryId: 1, sectionId: 1, name: 'ls', description: 'list files',
        syntax: 'ls', example: 'ls -la', tags: [], isCustom: false, url: '',
        progress: null,
      }],
    }))
    const app = createApp('http://api.test')
    const res = await request(app).get('/categories/1/commands')
    expect(res.status).toBe(200)
    expect(res.text).toContain('unseen')
  })
})
