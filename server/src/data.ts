import fs from 'node:fs'
import path from 'node:path'
import type { Category, Section, Command, Knowledge } from './types'

interface RawCommand {
  name: string
  description: string
  syntax: string
  example: string
  tags: string[]
  url?: string
}

interface RawKnowledge {
  title: string
  body: string
  tags: string[]
  url?: string
}

export interface Dataset {
  categories: Category[]
  sections: Section[]
  commands: Command[]
  knowledge: Knowledge[]
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

function listSubdirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

export function buildData(categoriesDir: string): Dataset {
  const categories: Category[] = []
  const sections: Section[] = []
  const commands: Command[] = []
  const knowledge: Knowledge[] = []

  let catId = 1
  let secId = 1
  let cmdId = 1
  let knId = 1

  for (const slug of listSubdirs(categoriesDir)) {
    const catDir = path.join(categoriesDir, slug)
    const metaPath = path.join(catDir, 'meta.json')
    if (!fs.existsSync(metaPath)) continue

    const meta = readJson<{ name?: string }>(metaPath)
    categories.push({ id: catId, slug, name: meta.name ?? slug, icon: '', order: catId - 1 })

    const sectionsDir = path.join(catDir, 'sections')
    for (const secSlug of listSubdirs(sectionsDir)) {
      const secDir = path.join(sectionsDir, secSlug)
      const secMetaPath = path.join(secDir, 'meta.json')
      const secMeta = fs.existsSync(secMetaPath)
        ? readJson<{ title?: string }>(secMetaPath)
        : {}
      sections.push({
        id: secId, categoryId: catId, slug: secSlug,
        title: secMeta.title ?? secSlug, order: secId - 1,
      })

      const cmdPath = path.join(secDir, 'commands.json')
      if (fs.existsSync(cmdPath)) {
        for (const r of readJson<RawCommand[]>(cmdPath)) {
          commands.push({
            id: cmdId++, categoryId: catId, sectionId: secId,
            name: r.name, description: r.description, syntax: r.syntax,
            example: r.example, tags: r.tags, url: r.url ?? '', isCustom: false,
          })
        }
      }

      const knPath = path.join(secDir, 'knowledge.json')
      if (fs.existsSync(knPath)) {
        for (const r of readJson<RawKnowledge[]>(knPath)) {
          knowledge.push({
            id: knId++, categoryId: catId, sectionId: secId,
            title: r.title, body: r.body, tags: r.tags, url: r.url ?? '',
            isCustom: false, cloze: null,
          })
        }
      }

      secId++
    }
    catId++
  }

  return { categories, sections, commands, knowledge }
}
