import { Router } from 'express';
import { notFound, badRequest } from '../errors.js';
import { parseRecipeInput, parseId } from '../validation.js';
import { SORT_KEYS } from '../repository.js';

/**
 * @param {{ repo: import('../repository.js').RecipeRepository, images: import('../images.js').ImageStore }} deps
 */
export function recipesRouter({ repo, images }) {
  const router = Router();

  const load = (id) => {
    const recipe = repo.get(id);
    if (!recipe) throw notFound('Rezept');
    return recipe;
  };

  // Liste mit Suche, Tag-Filter, Sortierung und Paginierung
  router.get('/', (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : undefined;
    const sort = req.query.sort ?? 'newest';
    if (!SORT_KEYS.includes(sort)) throw badRequest(`sort muss einer von ${SORT_KEYS.join(', ')} sein`);
    const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
    const offset = req.query.offset === undefined ? 0 : Number(req.query.offset);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw badRequest('limit muss zwischen 1 und 200 liegen');
    if (!Number.isInteger(offset) || offset < 0) throw badRequest('offset muss >= 0 sein');

    res.json(repo.list({ q: q || undefined, tag: tag || undefined, sort, limit, offset }));
  });

  router.post('/', (req, res) => {
    const input = parseRecipeInput(req.body);
    const id = repo.create(input);
    res.status(201).location(`${req.baseUrl}/${id}`).json(repo.get(id));
  });

  router.get('/:id', (req, res) => {
    res.json(load(parseId(req.params.id)));
  });

  // Komplett ersetzen – nicht übergebene Felder werden geleert
  router.put('/:id', (req, res) => {
    const id = parseId(req.params.id);
    load(id);
    repo.update(id, parseRecipeInput(req.body));
    res.json(repo.get(id));
  });

  // Teilweise ändern – nur übergebene Felder werden geändert
  router.patch('/:id', (req, res) => {
    const id = parseId(req.params.id);
    load(id);
    repo.update(id, parseRecipeInput(req.body, { partial: true }));
    res.json(repo.get(id));
  });

  router.delete('/:id', async (req, res) => {
    const files = repo.delete(parseId(req.params.id));
    if (!files) throw notFound('Rezept');
    await Promise.all(files.map((f) => images.remove(f)));
    res.status(204).end();
  });

  return router;
}
