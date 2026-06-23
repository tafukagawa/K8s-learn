import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

interface RawCommand {
  name: string; description: string; syntax: string; example: string; tags: string[]; url?: string
}

interface RawKnowledge {
  title: string; body: string; tags: string[]; url?: string
}

export function importCategories(db: Database.Database, categoriesDir: string): void {
  if (!fs.existsSync(categoriesDir)) return
  const entries = fs.readdirSync(categoriesDir, { withFileTypes: true })
  const dirs = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))

  for (const [index, dir] of dirs.entries()) {
    const slug = dir.name
    const categoryPath = path.join(categoriesDir, slug)

    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug) as { id: number } | undefined
    let categoryId: number

    if (!existing) {
      const metaPath = path.join(categoryPath, 'meta.json')
      const name = fs.existsSync(metaPath)
        ? (JSON.parse(fs.readFileSync(metaPath, 'utf-8')).name ?? slug)
        : slug.charAt(0).toUpperCase() + slug.slice(1)
      const row = db.prepare(
        'INSERT INTO categories (slug, name, "order") VALUES (?, ?, ?) RETURNING id'
      ).get(slug, name, index) as { id: number }
      categoryId = row.id
    } else {
      categoryId = existing.id
    }

    const sectionsDir = path.join(categoryPath, 'sections')
    if (fs.existsSync(sectionsDir)) {
      importSections(db, categoryId, sectionsDir)
    } else {
      importFlatFiles(db, categoryId, categoryPath)
    }
  }
}

function importFlatFiles(db: Database.Database, categoryId: number, categoryPath: string): void {
  const commandsPath = path.join(categoryPath, 'commands.json')
  if (fs.existsSync(commandsPath)) {
    const already = db.prepare(
      'SELECT COUNT(*) as count FROM commands WHERE category_id = ? AND section_id IS NULL AND is_custom = 0'
    ).get(categoryId) as { count: number }
    if (already.count === 0) {
      const commands: RawCommand[] = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'))
      const stmt = db.prepare(
        'INSERT INTO commands (category_id, name, description, syntax, example, tags, url, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
      )
      for (const cmd of commands) {
        stmt.run(categoryId, cmd.name, cmd.description, cmd.syntax, cmd.example, JSON.stringify(cmd.tags), cmd.url ?? '')
      }
    }
  }

  const knowledgePath = path.join(categoryPath, 'knowledge.json')
  if (fs.existsSync(knowledgePath)) {
    const already = db.prepare(
      'SELECT COUNT(*) as count FROM knowledge WHERE category_id = ? AND section_id IS NULL AND is_custom = 0'
    ).get(categoryId) as { count: number }
    if (already.count === 0) {
      const items: RawKnowledge[] = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'))
      const stmt = db.prepare(
        'INSERT INTO knowledge (category_id, title, body, tags, url, is_custom) VALUES (?, ?, ?, ?, ?, 0)'
      )
      for (const item of items) {
        stmt.run(categoryId, item.title, item.body, JSON.stringify(item.tags), item.url ?? '')
      }
    }
  }
}

function importSections(db: Database.Database, categoryId: number, sectionsDir: string): void {
  // Remove old flat imports (non-custom, no section) when switching to sections layout
  db.prepare('DELETE FROM commands WHERE category_id = ? AND section_id IS NULL AND is_custom = 0').run(categoryId)
  db.prepare('DELETE FROM knowledge WHERE category_id = ? AND section_id IS NULL AND is_custom = 0').run(categoryId)

  const entries = fs.readdirSync(sectionsDir, { withFileTypes: true })
  const sectionDirs = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))

  for (const [order, sectionDir] of sectionDirs.entries()) {
    const sectionSlug = sectionDir.name
    const sectionPath = path.join(sectionsDir, sectionSlug)

    const existingSection = db.prepare(
      'SELECT id FROM sections WHERE category_id = ? AND slug = ?'
    ).get(categoryId, sectionSlug) as { id: number } | undefined
    let sectionId: number

    if (!existingSection) {
      const metaPath = path.join(sectionPath, 'meta.json')
      const title = fs.existsSync(metaPath)
        ? (JSON.parse(fs.readFileSync(metaPath, 'utf-8')).title ?? sectionSlug)
        : sectionSlug
      const row = db.prepare(
        'INSERT INTO sections (category_id, slug, title, "order") VALUES (?, ?, ?, ?) RETURNING id'
      ).get(categoryId, sectionSlug, title, order) as { id: number }
      sectionId = row.id
    } else {
      sectionId = existingSection.id
    }

    const commandsPath = path.join(sectionPath, 'commands.json')
    if (fs.existsSync(commandsPath)) {
      const already = db.prepare(
        'SELECT COUNT(*) as count FROM commands WHERE category_id = ? AND section_id = ? AND is_custom = 0'
      ).get(categoryId, sectionId) as { count: number }
      if (already.count === 0) {
        const commands: RawCommand[] = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'))
        const stmt = db.prepare(
          'INSERT INTO commands (category_id, section_id, name, description, syntax, example, tags, url, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
        )
        for (const cmd of commands) {
          stmt.run(categoryId, sectionId, cmd.name, cmd.description, cmd.syntax, cmd.example, JSON.stringify(cmd.tags), cmd.url ?? '')
        }
      }
    }

    const knowledgePath = path.join(sectionPath, 'knowledge.json')
    if (fs.existsSync(knowledgePath)) {
      const already = db.prepare(
        'SELECT COUNT(*) as count FROM knowledge WHERE category_id = ? AND section_id = ? AND is_custom = 0'
      ).get(categoryId, sectionId) as { count: number }
      if (already.count === 0) {
        const items: RawKnowledge[] = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'))
        const stmt = db.prepare(
          'INSERT INTO knowledge (category_id, section_id, title, body, tags, url, is_custom) VALUES (?, ?, ?, ?, ?, ?, 0)'
        )
        for (const item of items) {
          stmt.run(categoryId, sectionId, item.title, item.body, JSON.stringify(item.tags), item.url ?? '')
        }
      }
    }
  }
}
