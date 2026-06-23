import Database from 'better-sqlite3'
import { SCHEMA_SQL } from './schema'

export function applySchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL)
}

export function runMigrations(db: Database.Database): void {
  const commandCols = (db.prepare('PRAGMA table_info(commands)').all() as any[]).map(c => c.name)
  if (!commandCols.includes('url')) {
    db.exec("ALTER TABLE commands ADD COLUMN url TEXT NOT NULL DEFAULT ''")
  }
  const knowledgeCols = (db.prepare('PRAGMA table_info(knowledge)').all() as any[]).map(c => c.name)
  if (!knowledgeCols.includes('url')) {
    db.exec("ALTER TABLE knowledge ADD COLUMN url TEXT NOT NULL DEFAULT ''")
  }
}
