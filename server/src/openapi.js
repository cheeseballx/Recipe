import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// Die API-Beschreibung liegt als YAML in server/openapi.yaml (einzige Quelle).
// Sie wird beim Start einmal gelesen und als YAML und JSON ausgeliefert.
export const OPENAPI_FILE = path.resolve(import.meta.dirname, '..', 'openapi.yaml');

export function loadOpenApi(file = OPENAPI_FILE) {
  const yaml = fs.readFileSync(file, 'utf8');
  return { yaml, json: parse(yaml) };
}
