import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCategories, fetchCommands } from '../src/apiClient'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('fetchCategories', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, slug: 'demo', name: 'Demo', icon: '', order: 0 }],
    }))
    const categories = await fetchCategories('http://api.test')
    expect(categories).toEqual([{ id: 1, slug: 'demo', name: 'Demo', icon: '', order: 0 }])
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/categories')
  })

  it('throws when the API responds with a non-2xx status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(fetchCategories('http://api.test')).rejects.toThrow('500')
  })
})

describe('fetchCommands', () => {
  it('returns parsed JSON for a given category id', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        id: 1, categoryId: 1, sectionId: 1, name: 'echo hi', description: 'prints hi',
        syntax: 'echo hi', example: 'echo hi', tags: ['demo'], isCustom: false, url: '',
        progress: null,
      }],
    }))
    const commands = await fetchCommands('http://api.test', 1)
    expect(commands[0].name).toBe('echo hi')
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/categories/1/commands')
  })
})
