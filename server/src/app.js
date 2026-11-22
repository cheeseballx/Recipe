import express from 'express';
import { ApiError } from './errors.js';
import { RecipeRepository } from './repository.js';
import { recipesRouter } from './routes/recipes.js';
import { imagesRouter } from './routes/images.js';
import { loadOpenApi } from './openapi.js';

/**
 * Baut die Express-App. Wird von index.js und den Tests verwendet.
 * @param {{ db: import('node:sqlite').DatabaseSync, images: import('./images.js').ImageStore,
 *           maxImageBytes?: number, corsOrigins?: string[] }} options
 */
export function createApp({ db, images, maxImageBytes = 10 * 1024 * 1024, corsOrigins = [] }) {
  const app = express();
  const repo = new RecipeRepository(db);
  const openapi = loadOpenApi();

  app.disable('x-powered-by');
  app.set('json spaces', 2);

  // Minimal-CORS, damit ein späteres Frontend (z. B. Vite auf :5173) zugreifen kann
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (corsOrigins.includes('*') || corsOrigins.includes(origin))) {
      res.set('Access-Control-Allow-Origin', corsOrigins.includes('*') ? '*' : origin);
      res.set('Vary', 'Origin');
      res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Expose-Headers', 'Location');
      if (req.method === 'OPTIONS') return res.status(204).end();
    }
    next();
  });

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/openapi.yaml', (req, res) => res.type('application/yaml; charset=utf-8').send(openapi.yaml));
  app.get('/api/openapi.json', (req, res) => res.json(openapi.json));
  app.get('/api/tags', (req, res) => res.json(repo.tags()));
  app.use('/api/recipes/:id/images', imagesRouter({ repo, images, maxImageBytes }));
  app.use('/api/recipes', recipesRouter({ repo, images }));

  // Hochgeladene Bilder ausliefern
  app.use('/uploads', express.static(images.dir, {
    immutable: true,
    maxAge: '365d',
    fallthrough: false,
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }));

  app.use('/api', (req, res, next) => next(new ApiError(404, 'not_found', `Route ${req.method} ${req.originalUrl} existiert nicht`)));

  // Zentrale Fehlerbehandlung – alle Fehler als { error: { code, message, details? } }
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    let apiErr = err;
    if (!(err instanceof ApiError)) {
      if (err.type === 'entity.parse.failed') apiErr = new ApiError(400, 'invalid_json', 'Request-Body ist kein gültiges JSON');
      else if (err.type === 'entity.too.large') apiErr = new ApiError(413, 'payload_too_large', 'Request-Body ist zu groß');
      else if (err.status === 404 || err.statusCode === 404) apiErr = new ApiError(404, 'not_found', 'Datei nicht gefunden');
      else {
        console.error(err);
        apiErr = new ApiError(500, 'internal_error', 'Interner Serverfehler');
      }
    }
    res.status(apiErr.status).json({
      error: { code: apiErr.code, message: apiErr.message, ...(apiErr.details && { details: apiErr.details }) },
    });
  });

  return app;
}
