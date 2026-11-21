import { transaction, fold } from './db.js';
import { badRequest } from './errors.js';

const now = () => new Date().toISOString();

const SORTS = {
  newest: 'r.created_at DESC, r.id DESC',
  oldest: 'r.created_at ASC, r.id ASC',
  updated: 'r.updated_at DESC, r.id DESC',
  title: 'r.title COLLATE NOCASE ASC, r.id ASC',
};
export const SORT_KEYS = Object.keys(SORTS);

function imageDto(row) {
  return {
    id: row.id,
    url: `/uploads/${row.filename}`,
    caption: row.caption,
    position: row.position,
    mimeType: row.mime_type,
    size: row.size,
    originalName: row.original_name,
    createdAt: row.created_at,
  };
}

export class RecipeRepository {
  /** @param {import('node:sqlite').DatabaseSync} db */
  constructor(db) {
    this.db = db;
  }

  // ---------- Lesen ----------

  list({ q, tag, sort = 'newest', limit = 50, offset = 0 } = {}) {
    const where = [];
    const params = {};
    if (q) {
      // fold() = Unicode-fähiges lowercase (siehe db.js), damit "äpfel" auch "Äpfel" findet
      const has = (col) => `instr(fold(${col}), :q) > 0`;
      where.push(`(${has('r.title')} OR ${has('r.subtitle')} OR ${has('r.description')}
        OR EXISTS (SELECT 1 FROM ingredients i WHERE i.recipe_id = r.id AND ${has('i.name')})
        OR EXISTS (SELECT 1 FROM tags t WHERE t.recipe_id = r.id AND ${has('t.name')}))`);
      params.q = fold(q);
    }
    if (tag) {
      where.push('EXISTS (SELECT 1 FROM tags t WHERE t.recipe_id = r.id AND fold(t.name) = :tag)');
      params.tag = fold(tag);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const total = this.db.prepare(`SELECT COUNT(*) AS n FROM recipes r ${whereSql}`).get(params).n;
    const rows = this.db
      .prepare(`SELECT r.* FROM recipes r ${whereSql} ORDER BY ${SORTS[sort] ?? SORTS.newest} LIMIT :limit OFFSET :offset`)
      .all({ ...params, limit, offset });

    return { items: rows.map((r) => this.#summary(r)), total, limit, offset };
  }

  get(id) {
    const row = this.db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
    if (!row) return null;
    const images = this.#images(id);
    return {
      ...this.#base(row, images),
      ingredients: this.db
        .prepare('SELECT name, amount, unit, note FROM ingredients WHERE recipe_id = ? ORDER BY position')
        .all(id)
        .map((i) => ({ ...i })),
      steps: this.db
        .prepare('SELECT position, title, text FROM steps WHERE recipe_id = ? ORDER BY position')
        .all(id)
        .map((s) => ({ number: s.position, title: s.title, text: s.text })),
      images,
    };
  }

  exists(id) {
    return !!this.db.prepare('SELECT 1 FROM recipes WHERE id = ?').get(id);
  }

  tags() {
    return this.db
      .prepare('SELECT MIN(name) AS name, COUNT(*) AS count FROM tags GROUP BY fold(name) ORDER BY count DESC, fold(name)')
      .all()
      .map((t) => ({ name: t.name, count: t.count }));
  }

  // ---------- Schreiben ----------

  create(input) {
    return transaction(this.db, () => {
      const ts = now();
      const { lastInsertRowid } = this.db
        .prepare(`INSERT INTO recipes (title, subtitle, description, servings, prep_minutes, wait_minutes, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(input.title, input.subtitle ?? null, input.description ?? null, input.servings ?? null,
          input.prepMinutes ?? null, input.waitMinutes ?? null, ts, ts);
      const id = Number(lastInsertRowid);
      if (input.coverImageId != null) this.#assertImageOfRecipe(id, input.coverImageId);
      this.#replaceChildren(id, input);
      return id;
    });
  }

  /** Aktualisiert nur die übergebenen Felder. Listen (tags/ingredients/steps) werden komplett ersetzt. */
  update(id, input) {
    return transaction(this.db, () => {
      const columns = {
        title: 'title', subtitle: 'subtitle', description: 'description', servings: 'servings',
        prepMinutes: 'prep_minutes', waitMinutes: 'wait_minutes', coverImageId: 'cover_image_id',
      };
      if (input.coverImageId != null) this.#assertImageOfRecipe(id, input.coverImageId);

      const sets = [];
      const values = [];
      for (const [key, col] of Object.entries(columns)) {
        if (Object.hasOwn(input, key)) {
          sets.push(`${col} = ?`);
          values.push(input[key] ?? null);
        }
      }
      sets.push('updated_at = ?');
      values.push(now());
      this.db.prepare(`UPDATE recipes SET ${sets.join(', ')} WHERE id = ?`).run(...values, id);
      this.#replaceChildren(id, input);
    });
  }

  /** Löscht das Rezept und gibt die Dateinamen der zugehörigen Bilder zurück. */
  delete(id) {
    return transaction(this.db, () => {
      const files = this.db.prepare('SELECT filename FROM images WHERE recipe_id = ?').all(id).map((r) => r.filename);
      const { changes } = this.db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
      return changes ? files : null;
    });
  }

  // ---------- Bilder ----------

  listImages(recipeId) {
    return this.#images(recipeId);
  }

  getImage(recipeId, imageId) {
    const row = this.db.prepare('SELECT * FROM images WHERE id = ? AND recipe_id = ?').get(imageId, recipeId);
    return row ? imageDto(row) : null;
  }

  addImage(recipeId, { filename, originalName, mimeType, size, caption }) {
    return transaction(this.db, () => {
      const { next } = this.db
        .prepare('SELECT COALESCE(MAX(position), 0) + 1 AS next FROM images WHERE recipe_id = ?')
        .get(recipeId);
      const { lastInsertRowid } = this.db
        .prepare(`INSERT INTO images (recipe_id, filename, original_name, mime_type, size, caption, position, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(recipeId, filename, originalName ?? null, mimeType, size, caption ?? null, next, now());
      this.#touch(recipeId);
      return Number(lastInsertRowid);
    });
  }

  updateImage(recipeId, imageId, { caption, position }) {
    transaction(this.db, () => {
      if (caption !== undefined) {
        this.db.prepare('UPDATE images SET caption = ? WHERE id = ?').run(caption, imageId);
      }
      if (position != null) {
        const ids = this.db
          .prepare('SELECT id FROM images WHERE recipe_id = ? AND id != ? ORDER BY position')
          .all(recipeId, imageId)
          .map((r) => r.id);
        ids.splice(Math.min(position, ids.length + 1) - 1, 0, imageId);
        this.#renumberImages(ids);
      }
      this.#touch(recipeId);
    });
  }

  /** Löscht ein Bild und gibt dessen Dateinamen zurück. */
  deleteImage(recipeId, imageId) {
    return transaction(this.db, () => {
      const row = this.db.prepare('SELECT filename FROM images WHERE id = ? AND recipe_id = ?').get(imageId, recipeId);
      if (!row) return null;
      this.db.prepare('DELETE FROM images WHERE id = ?').run(imageId);
      this.#renumberImages(
        this.db.prepare('SELECT id FROM images WHERE recipe_id = ? ORDER BY position').all(recipeId).map((r) => r.id),
      );
      this.#touch(recipeId);
      return row.filename;
    });
  }

  // ---------- intern ----------

  #images(recipeId) {
    return this.db
      .prepare('SELECT * FROM images WHERE recipe_id = ? ORDER BY position')
      .all(recipeId)
      .map(imageDto);
  }

  #base(row, images) {
    const cover = images.find((i) => i.id === row.cover_image_id) ?? images[0] ?? null;
    const total = row.prep_minutes == null && row.wait_minutes == null
      ? null
      : (row.prep_minutes ?? 0) + (row.wait_minutes ?? 0);
    return {
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      servings: row.servings,
      prepMinutes: row.prep_minutes,
      waitMinutes: row.wait_minutes,
      totalMinutes: total,
      tags: this.db.prepare('SELECT name FROM tags WHERE recipe_id = ? ORDER BY rowid').all(row.id).map((t) => t.name),
      coverImageId: row.cover_image_id,
      coverImage: cover && { id: cover.id, url: cover.url, caption: cover.caption },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  #summary(row) {
    const images = this.#images(row.id);
    const { coverImageId, ...base } = this.#base(row, images);
    return { ...base, imageCount: images.length };
  }

  #replaceChildren(id, input) {
    if (input.tags) {
      this.db.prepare('DELETE FROM tags WHERE recipe_id = ?').run(id);
      const ins = this.db.prepare('INSERT INTO tags (recipe_id, name) VALUES (?, ?)');
      for (const t of input.tags) ins.run(id, t);
    }
    if (input.ingredients) {
      this.db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(id);
      const ins = this.db.prepare('INSERT INTO ingredients (recipe_id, position, name, amount, unit, note) VALUES (?, ?, ?, ?, ?, ?)');
      input.ingredients.forEach((i, idx) => ins.run(id, idx + 1, i.name, i.amount, i.unit, i.note));
    }
    if (input.steps) {
      this.db.prepare('DELETE FROM steps WHERE recipe_id = ?').run(id);
      const ins = this.db.prepare('INSERT INTO steps (recipe_id, position, title, text) VALUES (?, ?, ?, ?)');
      input.steps.forEach((s, idx) => ins.run(id, idx + 1, s.title, s.text));
    }
  }

  #assertImageOfRecipe(recipeId, imageId) {
    if (!this.db.prepare('SELECT 1 FROM images WHERE id = ? AND recipe_id = ?').get(imageId, recipeId)) {
      throw badRequest('Ungültige Eingabe', [{ field: 'coverImageId', message: 'Bild gehört nicht zu diesem Rezept' }]);
    }
  }

  #renumberImages(ids) {
    const upd = this.db.prepare('UPDATE images SET position = ? WHERE id = ?');
    ids.forEach((imgId, idx) => upd.run(idx + 1, imgId));
  }

  #touch(recipeId) {
    this.db.prepare('UPDATE recipes SET updated_at = ? WHERE id = ?').run(now(), recipeId);
  }
}
