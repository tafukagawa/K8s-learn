export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  slug  TEXT    NOT NULL UNIQUE,
  name  TEXT    NOT NULL,
  icon  TEXT    NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS commands (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  syntax      TEXT    NOT NULL DEFAULT '',
  example     TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '[]',
  is_custom   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS knowledge (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title       TEXT    NOT NULL,
  body        TEXT    NOT NULL DEFAULT '',
  tags        TEXT    NOT NULL DEFAULT '[]',
  is_custom   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progress (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  item_type     TEXT    NOT NULL CHECK(item_type IN ('command', 'knowledge')),
  item_id       INTEGER NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'unseen' CHECK(status IN ('unseen', 'learning', 'done')),
  correct_count INTEGER NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TEXT,
  UNIQUE(item_type, item_id)
);

CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  slug        TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS roadmap_steps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title       TEXT    NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  item_ids    TEXT    NOT NULL DEFAULT '[]'
);
`
