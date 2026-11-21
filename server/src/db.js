import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS recipes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT    NOT NULL,
  subtitle       TEXT,
  description    TEXT,
  servings       INTEGER,
  prep_minutes   INTEGER,
  wait_minutes   INTEGER,
  cover_image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  created_at     TEXT    NOT NULL,
  updated_at     TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL,
  name      TEXT    NOT NULL,
  amount    REAL,
  unit      TEXT,
  note      TEXT
);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id, position);

CREATE TABLE IF NOT EXISTS steps (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  position  INTEGER NOT NULL,
  title     TEXT,
  text      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps(recipe_id, position);

CREATE TABLE IF NOT EXISTS tags (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name      TEXT    NOT NULL COLLATE NOCASE,
  PRIMARY KEY (recipe_id, name)
);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

CREATE TABLE IF NOT EXISTS images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id     INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  filename      TEXT    NOT NULL UNIQUE,
  original_name TEXT,
  mime_type     TEXT    NOT NULL,
  size          INTEGER NOT NULL,
  caption       TEXT,
  position      INTEGER NOT NULL,
  created_at    TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_images_recipe ON images(recipe_id, position);
`;

/** Groß-/Kleinschreibung für die Suche angleichen (auch Umlaute). */
export const fold = (value) => (value == null ? null : String(value).toLocaleLowerCase('de'));

export function openDatabase(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  db.function('fold', { deterministic: true }, fold);
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}

/** Führt fn in einer Transaktion aus (Rollback bei Fehler). */
export function transaction(db, fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
