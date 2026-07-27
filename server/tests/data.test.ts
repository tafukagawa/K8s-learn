import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { buildData } from '../src/data'

const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'categories')

describe('buildData', () => {
  it('loads categories, sections, commands, and knowledge from disk', () => {
    const db = buildData(FIXTURE_DIR)

    expect(db.categories).toEqual([
      { id: 1, slug: 'demo', name: 'Demo', icon: '', order: 0 },
    ])
    expect(db.sections).toEqual([
      { id: 1, categoryId: 1, slug: 'intro', title: 'Intro', order: 0 },
    ])
    expect(db.commands).toEqual([
      {
        id: 1, categoryId: 1, sectionId: 1,
        name: 'echo hi', description: 'prints hi', syntax: 'echo hi',
        example: 'echo hi', tags: ['demo'], url: '', isCustom: false,
      },
    ])
    expect(db.knowledge).toEqual([
      {
        id: 1, categoryId: 1, sectionId: 1,
        title: 'What is a Pod?', body: 'The smallest deployable unit in Kubernetes.',
        tags: ['k8s'], url: '', isCustom: false, cloze: null,
      },
    ])
  })
})
