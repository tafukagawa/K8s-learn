import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
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

  it('strips a leading UTF-8 BOM before parsing meta.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bom-fixture-'))
    const catDir = path.join(tmpDir, 'bomcat')
    fs.mkdirSync(catDir, { recursive: true })
    fs.writeFileSync(
      path.join(catDir, 'meta.json'),
      '﻿' + JSON.stringify({ name: 'BOM Test' })
    )

    expect(() => buildData(tmpDir)).not.toThrow()
    const db = buildData(tmpDir)
    expect(db.categories[0].name).toBe('BOM Test')
  })
})
