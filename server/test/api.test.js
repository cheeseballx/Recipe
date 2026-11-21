import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db.js';
import { ImageStore } from '../src/images.js';
import { createApp } from '../src/app.js';

// 1x1 PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

let server, base, tmp;

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-test-'));
  const images = new ImageStore(path.join(tmp, 'uploads'));
  await images.init();
  const app = createApp({ db: openDatabase(':memory:'), images, maxImageBytes: 1024 * 1024, corsOrigins: ['http://localhost:5173'] });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

const api = async (method, url, body) => {
  const init = { method, headers: {} };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(base + url, init);
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
};

const upload = (id, buffers, caption) => {
  const form = new FormData();
  for (const [i, b] of buffers.entries()) form.append('image', new Blob([b], { type: 'image/png' }), `bild${i}.png`);
  if (caption) form.append('caption', caption);
  return api('POST', `/api/recipes/${id}/images`, form);
};

const pizza = {
  title: 'Pizzateig',
  subtitle: 'Neapolitanisch',
  description: 'Ein einfacher Teig.',
  servings: 4,
  prepMinutes: 20,
  waitMinutes: 120,
  tags: ['Italienisch', 'Teig', 'italienisch'],
  ingredients: [{ name: 'Mehl', amount: 500, unit: 'g', note: 'Type 00' }, 'Salz'],
  steps: [{ title: 'Kneten', text: 'Alles verkneten.' }, 'Gehen lassen.'],
};

test('Rezept anlegen, lesen, auflisten', async () => {
  const created = await api('POST', '/api/recipes', pizza);
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), `/api/recipes/${created.body.id}`);
  assert.equal(created.body.totalMinutes, 140);
  assert.deepEqual(created.body.tags, ['Italienisch', 'Teig']);
  assert.deepEqual(created.body.ingredients[1], { name: 'Salz', amount: null, unit: null, note: null });
  assert.deepEqual(created.body.steps[1], { number: 2, title: null, text: 'Gehen lassen.' });
  assert.equal(created.body.coverImage, null);

  const got = await api('GET', `/api/recipes/${created.body.id}`);
  assert.deepEqual(got.body, created.body);

  await api('POST', '/api/recipes', { title: 'Apfelkuchen', tags: ['Kuchen'], ingredients: ['Äpfel'] });
  const list = await api('GET', '/api/recipes?sort=title');
  assert.equal(list.body.total, 2);
  assert.deepEqual(list.body.items.map((r) => r.title), ['Apfelkuchen', 'Pizzateig']);
  assert.equal(list.body.items[0].ingredients, undefined, 'Liste enthält nur Zusammenfassungen');

  assert.equal((await api('GET', '/api/recipes?q=mehl')).body.total, 1);
  assert.equal((await api('GET', '/api/recipes?q=äpfel')).body.items[0].title, 'Apfelkuchen');
  assert.equal((await api('GET', '/api/recipes?q=%25')).body.total, 0, '% wird escaped');
  assert.equal((await api('GET', '/api/recipes?tag=kuchen')).body.total, 1);
  assert.equal((await api('GET', '/api/recipes?limit=1&offset=1&sort=title')).body.items[0].title, 'Pizzateig');

  await api('POST', '/api/recipes', { title: 'Baklava', tags: ['Süß'] });
  await api('POST', '/api/recipes', { title: 'Halva', tags: ['SÜSS', 'süß'] });
  assert.equal((await api('GET', '/api/recipes?tag=SÜß')).body.total, 2);
  await api('DELETE', `/api/recipes/${(await api('GET', '/api/recipes?q=baklava')).body.items[0].id}`);
  await api('DELETE', `/api/recipes/${(await api('GET', '/api/recipes?q=halva')).body.items[0].id}`);

  const tags = await api('GET', '/api/tags');
  assert.deepEqual(tags.body.map((t) => t.name).sort(), ['Italienisch', 'Kuchen', 'Teig']);
});

test('Validierung', async () => {
  const r = await api('POST', '/api/recipes', { title: '  ', servings: 0, steps: [{}], foo: 1 });
  assert.equal(r.status, 400);
  assert.equal(r.body.error.code, 'validation_error');
  const fields = r.body.error.details.map((d) => d.field).sort();
  assert.deepEqual(fields, ['foo', 'servings', 'steps[0].text', 'title']);

  assert.equal((await api('POST', '/api/recipes', '{kaputt')).body.error.code, 'invalid_json');
  assert.equal((await api('GET', '/api/recipes/abc')).status, 400);
  assert.equal((await api('GET', '/api/recipes/99999')).status, 404);
  assert.equal((await api('GET', '/api/recipes?sort=quatsch')).status, 400);
  assert.equal((await api('GET', '/api/gibtsnicht')).status, 404);
});

test('PATCH ändert nur übergebene Felder, PUT ersetzt alles', async () => {
  const { body: r } = await api('POST', '/api/recipes', pizza);
  const patched = await api('PATCH', `/api/recipes/${r.id}`, { title: 'Pizza', steps: ['Nur ein Schritt'] });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.title, 'Pizza');
  assert.equal(patched.body.description, pizza.description);
  assert.equal(patched.body.ingredients.length, 2);
  assert.equal(patched.body.steps.length, 1);

  const put = await api('PUT', `/api/recipes/${r.id}`, { title: 'Nur Titel' });
  assert.equal(put.body.description, null);
  assert.deepEqual(put.body.ingredients, []);
  assert.deepEqual(put.body.tags, []);

  assert.equal((await api('PUT', `/api/recipes/${r.id}`, { description: 'ohne Titel' })).status, 400);
  assert.equal((await api('PATCH', '/api/recipes/99999', { title: 'x' })).status, 404);
});

test('Bilder hochladen, ändern, sortieren, löschen', async () => {
  const { body: r } = await api('POST', '/api/recipes', { title: 'Mit Bildern' });

  const one = await upload(r.id, [PNG], 'Fertige Pizza');
  assert.equal(one.status, 201);
  assert.equal(one.body.mimeType, 'image/png');
  assert.equal(one.body.caption, 'Fertige Pizza');
  assert.match(one.body.url, /^\/uploads\/[0-9a-f-]+\.png$/);

  const file = await fetch(base + one.body.url);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), PNG);

  const many = await upload(r.id, [PNG, PNG]);
  assert.equal(many.body.length, 2);
  assert.deepEqual(many.body.map((i) => i.position), [2, 3]);

  let recipe = (await api('GET', `/api/recipes/${r.id}`)).body;
  assert.equal(recipe.images.length, 3);
  assert.equal(recipe.coverImage.id, one.body.id, 'erstes Bild ist Standard-Titelbild');

  // Titelbild setzen
  recipe = (await api('PATCH', `/api/recipes/${r.id}`, { coverImageId: many.body[1].id })).body;
  assert.equal(recipe.coverImage.id, many.body[1].id);

  // Fremdes Bild als Cover ablehnen
  const { body: other } = await api('POST', '/api/recipes', { title: 'Anderes' });
  assert.equal((await api('PATCH', `/api/recipes/${other.id}`, { coverImageId: one.body.id })).status, 400);
  assert.equal((await api('GET', `/api/recipes/${other.id}/images/${one.body.id}`)).status, 404);

  // Reihenfolge + Caption
  const moved = await api('PATCH', `/api/recipes/${r.id}/images/${many.body[1].id}`, { position: 1, caption: 'Nahaufnahme' });
  assert.equal(moved.body.position, 1);
  assert.equal(moved.body.caption, 'Nahaufnahme');
  const order = (await api('GET', `/api/recipes/${r.id}/images`)).body.map((i) => i.id);
  assert.deepEqual(order, [many.body[1].id, one.body.id, many.body[0].id]);

  // Löschen des Cover-Bilds -> Cover fällt aufs erste Bild zurück
  assert.equal((await api('DELETE', `/api/recipes/${r.id}/images/${many.body[1].id}`)).status, 204);
  recipe = (await api('GET', `/api/recipes/${r.id}`)).body;
  assert.equal(recipe.coverImageId, null);
  assert.equal(recipe.coverImage.id, one.body.id);
  assert.deepEqual(recipe.images.map((i) => i.position), [1, 2]);
  assert.equal((await fetch(base + moved.body.url)).status, 404, 'Datei ist weg');
});

test('Bild-Upload: ungültige Dateien', async () => {
  const { body: r } = await api('POST', '/api/recipes', { title: 'Upload-Fehler' });
  const notImage = await upload(r.id, [Buffer.from('<?php echo "hallo"; ?>  ')]);
  assert.equal(notImage.status, 415);
  const tooBig = await upload(r.id, [Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)])]);
  assert.equal(tooBig.status, 413);
  assert.equal((await api('POST', `/api/recipes/${r.id}/images`, new FormData())).status, 400);
  assert.equal((await upload(99999, [PNG])).status, 404);
  assert.equal((await api('GET', `/api/recipes/${r.id}/images`)).body.length, 0);
});

test('Rezept löschen entfernt auch Bilddateien', async () => {
  const { body: r } = await api('POST', '/api/recipes', { title: 'Weg damit' });
  const img = (await upload(r.id, [PNG])).body;
  assert.equal((await api('DELETE', `/api/recipes/${r.id}`)).status, 204);
  assert.equal((await api('GET', `/api/recipes/${r.id}`)).status, 404);
  assert.equal((await fetch(base + img.url)).status, 404);
  assert.equal((await api('DELETE', `/api/recipes/${r.id}`)).status, 404);
});

test('CORS und OpenAPI', async () => {
  const pre = await fetch(base + '/api/recipes', { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const other = await fetch(base + '/api/health', { headers: { origin: 'http://evil.example' } });
  assert.equal(other.headers.get('access-control-allow-origin'), null);

  const spec = await api('GET', '/api/openapi.json');
  assert.equal(spec.body.openapi, '3.1.0');
});
