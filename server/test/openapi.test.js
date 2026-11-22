// Prüft, dass openapi.yaml gültig ist und zur tatsächlichen API passt:
// Jede getestete Antwort wird gegen das Schema aus der YAML validiert.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { openDatabase } from '../src/db.js';
import { ImageStore } from '../src/images.js';
import { createApp } from '../src/app.js';
import { loadOpenApi } from '../src/openapi.js';

const { json: spec } = loadOpenApi();
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema({ ...spec, $id: 'spec' });

const pointer = (...parts) => parts.map((p) => String(p).replaceAll('~', '~0').replaceAll('/', '~1')).join('/');
const resolve = (obj) => {
  while (obj?.$ref) {
    obj = obj.$ref.slice(2).split('/').reduce((o, k) => o[k.replaceAll('~1', '/').replaceAll('~0', '~')], spec);
  }
  return obj;
};

/** Validiert einen Body gegen das Schema einer Response aus der Spezifikation. */
function assertMatchesSpec(method, route, status, body) {
  const op = spec.paths[route]?.[method];
  assert.ok(op, `${method.toUpperCase()} ${route} fehlt in openapi.yaml`);
  const responseRef = op.responses[status];
  assert.ok(responseRef, `${method.toUpperCase()} ${route}: Status ${status} ist nicht dokumentiert`);
  const response = resolve(responseRef);
  if (body === null) {
    assert.equal(response.content, undefined, `${route} ${status} sollte keinen Body dokumentieren`);
    return;
  }
  const schemaPath = responseRef.$ref
    ? `spec#/${responseRef.$ref.slice(2)}/content/${pointer('application/json')}/schema`
    : `spec#/${pointer('paths', route, method, 'responses', status, 'content', 'application/json', 'schema')}`;
  const validate = ajv.getSchema(schemaPath) ?? ajv.compile({ $ref: schemaPath });
  assert.ok(validate(body), `${method.toUpperCase()} ${route} ${status}: ${ajv.errorsText(validate.errors)}\n${JSON.stringify(body, null, 2)}`);
}

function assertRequestValid(route, method, body, contentType = 'application/json') {
  const p = `spec#/${pointer('paths', route, method, 'requestBody', 'content', contentType, 'schema')}`;
  const validate = ajv.compile({ $ref: p });
  return validate(body) ? null : ajv.errorsText(validate.errors);
}

let server, base, tmp;
before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-oas-'));
  const images = new ImageStore(path.join(tmp, 'uploads'));
  await images.init();
  server = createApp({ db: openDatabase(':memory:'), images, maxImageBytes: 100_000 }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function call(method, url, route, body) {
  const init = { method: method.toUpperCase(), headers: {} };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(base + url, init);
  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;
  assertMatchesSpec(method, route, String(res.status), parsed);
  return { status: res.status, body: parsed };
}

test('openapi.yaml: Grundstruktur und alle $refs auflösbar', () => {
  assert.equal(spec.openapi, '3.1.0');
  const ids = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === 'object') {
      if (typeof node.$ref === 'string') assert.ok(resolve({ $ref: node.$ref }), `$ref ${node.$ref} nicht auflösbar`);
      Object.values(node).forEach(walk);
    }
  };
  walk(spec);
  for (const [route, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (method === 'parameters') continue;
      assert.ok(op.operationId, `${method} ${route} ohne operationId`);
      assert.ok(!ids.has(op.operationId), `operationId ${op.operationId} doppelt`);
      ids.add(op.operationId);
    }
  }
  // Alle Schemas kompilierbar
  for (const name of Object.keys(spec.components.schemas)) ajv.compile({ $ref: `spec#/components/schemas/${name}` });
});

test('openapi.yaml: Beispiele passen zu den Request-Schemas', () => {
  const ex = (name) => resolve(spec.paths['/api/recipes'].post.requestBody.content['application/json'].examples[name]).value;
  assert.equal(assertRequestValid('/api/recipes', 'post', ex('vollständig')), null);
  assert.equal(assertRequestValid('/api/recipes', 'post', ex('minimal')), null);
  for (const e of Object.values(spec.paths['/api/recipes/{id}'].patch.requestBody.content['application/json'].examples)) {
    assert.equal(assertRequestValid('/api/recipes/{id}', 'patch', e.value), null);
  }
  // Negativ: Titel fehlt bei POST, aber nicht bei PATCH
  assert.notEqual(assertRequestValid('/api/recipes', 'post', { servings: 2 }), null);
  assert.equal(assertRequestValid('/api/recipes/{id}', 'patch', { servings: 2 }), null);
  assert.notEqual(assertRequestValid('/api/recipes/{id}', 'patch', { unbekannt: 1 }), null);
});

test('Antworten der API entsprechen openapi.yaml', async () => {
  const example = resolve(spec.components.examples.Pfannkuchen).value;
  const R = '/api/recipes';
  const RID = '/api/recipes/{id}';
  const IMG = '/api/recipes/{id}/images';
  const IMGID = '/api/recipes/{id}/images/{imageId}';

  const created = await call('post', R, R, example);
  assert.equal(created.status, 201);
  const id = created.body.id;
  await call('post', R, R, { title: '' });
  await call('get', `${R}?q=mehl&tag=Süß&sort=title&limit=5`, R);
  await call('get', `${R}?limit=0`, R);
  await call('get', `${R}/${id}`, RID);
  await call('get', `${R}/999`, RID);
  await call('get', `${R}/abc`, RID);
  await call('patch', `${R}/${id}`, RID, { subtitle: null, steps: ['Eins', { title: 'Zwei', text: 'Zwei' }] });
  // Gelesenes Rezept unverändert zurückschicken (Nur-Lese-Felder werden ignoriert)
  await call('put', `${R}/${id}`, RID, created.body);
  await call('put', `${R}/999`, RID, { title: 'x' });

  const form = new FormData();
  form.append('image', new Blob([PNG]), 'a.png');
  form.append('caption', 'Eins');
  const one = await call('post', `${R}/${id}/images`, IMG, form);
  assert.equal(one.status, 201);
  const form2 = new FormData();
  form2.append('image', new Blob([PNG]), 'b.png');
  form2.append('image', new Blob([PNG]), 'c.png');
  const two = await call('post', `${R}/${id}/images`, IMG, form2);
  const bad = new FormData();
  bad.append('image', new Blob(['kein Bild, nur Text']), 'x.png');
  assert.equal((await call('post', `${R}/${id}/images`, IMG, bad)).status, 415);
  const big = new FormData();
  big.append('image', new Blob([PNG, Buffer.alloc(200_000)]), 'big.png');
  assert.equal((await call('post', `${R}/${id}/images`, IMG, big)).status, 413);
  assert.equal((await call('post', `${R}/${id}/images`, IMG, new FormData())).status, 400);

  await call('get', `${R}/${id}/images`, IMG);
  await call('get', `${R}/${id}/images/${one.body.id}`, IMGID);
  await call('patch', `${R}/${id}/images/${two.body[1].id}`, IMGID, { position: 1, caption: null });
  await call('patch', `${R}/${id}/images/${one.body.id}`, IMGID, { position: 0 });
  await call('patch', `${R}/${id}`, RID, { coverImageId: two.body[0].id });
  await call('get', `${R}?sort=updated`, R);
  await call('delete', `${R}/${id}/images/${one.body.id}`, IMGID);
  await call('delete', `${R}/${id}/images/${one.body.id}`, IMGID);

  await call('get', '/api/tags', '/api/tags');
  await call('get', '/api/health', '/api/health');
  await call('delete', `${R}/${id}`, RID);
  await call('delete', `${R}/${id}`, RID);
});
