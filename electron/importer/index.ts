import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

interface RawCommand {
  name: string; description: string; syntax: string; example: string; tags: string[]
}

interface RawKnowledge {
  title: string; body: string; tags: string[]
}

export function importCategories(db: Database.Database, categoriesDir: string): void {
  const entries = fs.readdirSync(categoriesDir, { withFileTypes: true })
  const dirs = entries.filter(e => e.isDirectory())

  for (const [index, dir] of dirs.entries()) {
    const slug = dir.name
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug) as { id: number } | undefined
    if (existing) continue

    const categoryRow = db.prepare(
      'INSERT INTO categories (slug, name, "order") VALUES (?, ?, ?) RETURNING id'
    ).get(slug, slug.charAt(0).toUpperCase() + slug.slice(1), index) as { id: number }

    const categoryId = categoryRow.id
    const categoryPath = path.join(categoriesDir, slug)

    const commandsPath = path.join(categoryPath, 'commands.json')
    if (fs.existsSync(commandsPath)) {
      const commands: RawCommand[] = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'))
      const insertCmd = db.prepare(
        'INSERT INTO commands (category_id, name, description, syntax, example, tags, is_custom) VALUES (?, ?, ?, ?, ?, ?, 0)'
      )
      for (const cmd of commands) {
        insertCmd.run(categoryId, cmd.name, cmd.description, cmd.syntax, cmd.example, JSON.stringify(cmd.tags))
      }
    }

    const knowledgePath = path.join(categoryPath, 'knowledge.json')
    if (fs.existsSync(knowledgePath)) {
      const items: RawKnowledge[] = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'))
      const insertKnowledge = db.prepare(
        'INSERT INTO knowledge (category_id, title, body, tags, is_custom) VALUES (?, ?, ?, ?, 0)'
      )
      for (const item of items) {
        insertKnowledge.run(categoryId, item.title, item.body, JSON.stringify(item.tags))
      }
    }
  }
}
