import { badRequest } from './errors.js';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function text(errors, field, value, { required = false, max = 1000 } = {}) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    if (required) errors.push({ field, message: 'ist ein Pflichtfeld' });
    return null;
  }
  if (typeof value !== 'string') {
    errors.push({ field, message: 'muss ein Text sein' });
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) errors.push({ field, message: `darf höchstens ${max} Zeichen lang sein` });
  return trimmed;
}

function integer(errors, field, value, { min = 0, max = 1_000_000 } = {}) {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isInteger(n) || n < min || n > max) {
    errors.push({ field, message: `muss eine ganze Zahl zwischen ${min} und ${max} sein` });
    return null;
  }
  return n;
}

function number(errors, field, value) {
  if (value === undefined || value === null || value === '') return null;
  const n = typeof value === 'string' ? Number(value.replace(',', '.')) : value;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) {
    errors.push({ field, message: 'muss eine positive Zahl sein' });
    return null;
  }
  return n;
}

function list(errors, field, value, max, mapItem) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.push({ field, message: 'muss eine Liste sein' });
    return [];
  }
  if (value.length > max) errors.push({ field, message: `darf höchstens ${max} Einträge haben` });
  return value.slice(0, max).map((item, i) => mapItem(item, `${field}[${i}]`));
}

function ingredient(errors, item, field) {
  // Kurzform: "Salz" statt { name: "Salz" }
  if (typeof item === 'string') item = { name: item };
  if (!isPlainObject(item)) {
    errors.push({ field, message: 'muss ein Objekt sein' });
    return null;
  }
  return {
    name: text(errors, `${field}.name`, item.name, { required: true, max: 200 }),
    amount: number(errors, `${field}.amount`, item.amount),
    unit: text(errors, `${field}.unit`, item.unit, { max: 50 }),
    note: text(errors, `${field}.note`, item.note, { max: 500 }),
  };
}

function step(errors, item, field) {
  if (typeof item === 'string') item = { text: item };
  if (!isPlainObject(item)) {
    errors.push({ field, message: 'muss ein Objekt sein' });
    return null;
  }
  return {
    title: text(errors, `${field}.title`, item.title, { max: 200 }),
    text: text(errors, `${field}.text`, item.text, { required: true, max: 10_000 }),
  };
}

const RECIPE_FIELDS = [
  'title', 'subtitle', 'description', 'servings', 'prepMinutes', 'waitMinutes',
  'tags', 'ingredients', 'steps', 'coverImageId',
];
const READ_ONLY_FIELDS = ['id', 'images', 'coverImage', 'createdAt', 'updatedAt', 'totalMinutes'];

/**
 * Prüft und normalisiert einen Rezept-Body.
 * partial = true (PATCH): nur übergebene Felder werden zurückgegeben.
 */
export function parseRecipeInput(body, { partial = false } = {}) {
  if (!isPlainObject(body)) throw badRequest('Request-Body muss ein JSON-Objekt sein');

  const errors = [];
  const unknown = Object.keys(body).filter((k) => !RECIPE_FIELDS.includes(k) && !READ_ONLY_FIELDS.includes(k));
  for (const k of unknown) errors.push({ field: k, message: 'unbekanntes Feld' });

  const has = (k) => !partial || Object.hasOwn(body, k);
  const out = {};

  if (has('title')) out.title = text(errors, 'title', body.title, { required: true, max: 200 });
  if (has('subtitle')) out.subtitle = text(errors, 'subtitle', body.subtitle, { max: 300 });
  if (has('description')) out.description = text(errors, 'description', body.description, { max: 20_000 });
  if (has('servings')) out.servings = integer(errors, 'servings', body.servings, { min: 1, max: 1000 });
  if (has('prepMinutes')) out.prepMinutes = integer(errors, 'prepMinutes', body.prepMinutes);
  if (has('waitMinutes')) out.waitMinutes = integer(errors, 'waitMinutes', body.waitMinutes);
  if (has('coverImageId')) out.coverImageId = integer(errors, 'coverImageId', body.coverImageId, { min: 1, max: Number.MAX_SAFE_INTEGER });

  if (has('tags')) {
    const tags = list(errors, 'tags', body.tags, 30, (t, f) => text(errors, f, t, { required: true, max: 50 }));
    // Duplikate (case-insensitive) entfernen
    const seen = new Set();
    out.tags = tags.filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
  }
  if (has('ingredients')) out.ingredients = list(errors, 'ingredients', body.ingredients, 200, (i, f) => ingredient(errors, i, f));
  if (has('steps')) out.steps = list(errors, 'steps', body.steps, 200, (s, f) => step(errors, s, f));

  if (errors.length) throw badRequest('Ungültige Eingabe', errors);
  return out;
}

export function parseImageInput(body, { partial = true } = {}) {
  if (!isPlainObject(body)) throw badRequest('Request-Body muss ein JSON-Objekt sein');
  const errors = [];
  const out = {};
  const has = (k) => !partial || Object.hasOwn(body, k);
  if (has('caption')) out.caption = text(errors, 'caption', body.caption, { max: 500 });
  if (has('position')) out.position = integer(errors, 'position', body.position, { min: 1, max: 10_000 });
  for (const k of Object.keys(body)) {
    if (!['caption', 'position', 'id', 'url', 'filename', 'mimeType', 'size', 'createdAt', 'originalName'].includes(k)) {
      errors.push({ field: k, message: 'unbekanntes Feld' });
    }
  }
  if (errors.length) throw badRequest('Ungültige Eingabe', errors);
  return out;
}

export function parseId(value, what = 'ID') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw badRequest(`${what} muss eine positive ganze Zahl sein`);
  return n;
}
