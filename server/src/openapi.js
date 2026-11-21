// OpenAPI 3.1 Beschreibung der API – abrufbar unter GET /api/openapi.json
// (z. B. in https://editor.swagger.io oder Postman importieren)

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ content: { 'application/json': { schema } } });
const error = (description) => ({ description, ...json(ref('Error')) });
const idParam = (name, description) => ({ name, in: 'path', required: true, description, schema: { type: 'integer', minimum: 1 } });
const recipeId = idParam('id', 'Rezept-ID');
const imageId = idParam('imageId', 'Bild-ID');

const nullableString = { type: ['string', 'null'] };
const nullableInt = { type: ['integer', 'null'] };

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Rezepte-API',
    version: '1.0.0',
    description: 'Rezepte mit Texten (Beschreibung, Zutaten, Schritte) und Bildern anlegen, lesen, ändern und löschen.',
  },
  servers: [{ url: '/' }],
  tags: [{ name: 'Rezepte' }, { name: 'Bilder' }, { name: 'Sonstiges' }],
  paths: {
    '/api/recipes': {
      get: {
        tags: ['Rezepte'],
        summary: 'Rezepte auflisten',
        parameters: [
          { name: 'q', in: 'query', description: 'Volltextsuche (Titel, Untertitel, Beschreibung, Zutaten, Tags)', schema: { type: 'string' } },
          { name: 'tag', in: 'query', description: 'Nur Rezepte mit diesem Tag', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'updated', 'title'], default: 'newest' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200, default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
        ],
        responses: { 200: { description: 'Seite mit Rezepten', ...json(ref('RecipeList')) }, 400: error('Ungültige Parameter') },
      },
      post: {
        tags: ['Rezepte'],
        summary: 'Rezept anlegen',
        requestBody: { required: true, ...json(ref('RecipeInput')) },
        responses: { 201: { description: 'Angelegt', ...json(ref('Recipe')) }, 400: error('Validierungsfehler') },
      },
    },
    '/api/recipes/{id}': {
      parameters: [recipeId],
      get: {
        tags: ['Rezepte'],
        summary: 'Ein Rezept lesen',
        responses: { 200: { description: 'Rezept', ...json(ref('Recipe')) }, 404: error('Nicht gefunden') },
      },
      put: {
        tags: ['Rezepte'],
        summary: 'Rezept komplett ersetzen (fehlende Felder werden geleert)',
        requestBody: { required: true, ...json(ref('RecipeInput')) },
        responses: { 200: { description: 'Aktualisiert', ...json(ref('Recipe')) }, 400: error('Validierungsfehler'), 404: error('Nicht gefunden') },
      },
      patch: {
        tags: ['Rezepte'],
        summary: 'Rezept teilweise ändern (Listen wie steps werden komplett ersetzt)',
        requestBody: { required: true, ...json({ ...ref('RecipeInput'), required: [] }) },
        responses: { 200: { description: 'Aktualisiert', ...json(ref('Recipe')) }, 400: error('Validierungsfehler'), 404: error('Nicht gefunden') },
      },
      delete: {
        tags: ['Rezepte'],
        summary: 'Rezept inkl. aller Bilder löschen',
        responses: { 204: { description: 'Gelöscht' }, 404: error('Nicht gefunden') },
      },
    },
    '/api/recipes/{id}/images': {
      parameters: [recipeId],
      get: {
        tags: ['Bilder'],
        summary: 'Bilder eines Rezepts',
        responses: { 200: { description: 'Bilder', ...json({ type: 'array', items: ref('Image') }) }, 404: error('Rezept nicht gefunden') },
      },
      post: {
        tags: ['Bilder'],
        summary: 'Bild(er) hochladen',
        description: 'multipart/form-data mit Feld `image` (1–10 Dateien, JPEG/PNG/WebP/GIF/AVIF) und optional `caption`. '
          + 'Bei einer Datei wird ein Objekt, bei mehreren eine Liste zurückgegeben.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'array', items: { type: 'string', format: 'binary' } },
                  caption: { type: 'string', maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Hochgeladen', ...json({ oneOf: [ref('Image'), { type: 'array', items: ref('Image') }] }) },
          400: error('Keine Datei'),
          404: error('Rezept nicht gefunden'),
          413: error('Datei zu groß'),
          415: error('Kein unterstütztes Bildformat'),
        },
      },
    },
    '/api/recipes/{id}/images/{imageId}': {
      parameters: [recipeId, imageId],
      get: {
        tags: ['Bilder'],
        summary: 'Bild-Metadaten lesen',
        responses: { 200: { description: 'Bild', ...json(ref('Image')) }, 404: error('Nicht gefunden') },
      },
      patch: {
        tags: ['Bilder'],
        summary: 'Bildunterschrift oder Reihenfolge ändern',
        requestBody: {
          required: true,
          ...json({
            type: 'object',
            properties: { caption: nullableString, position: { type: 'integer', minimum: 1, description: 'Neue Position (1 = erstes Bild)' } },
          }),
        },
        responses: { 200: { description: 'Aktualisiert', ...json(ref('Image')) }, 400: error('Validierungsfehler'), 404: error('Nicht gefunden') },
      },
      delete: {
        tags: ['Bilder'],
        summary: 'Bild löschen',
        responses: { 204: { description: 'Gelöscht' }, 404: error('Nicht gefunden') },
      },
    },
    '/api/tags': {
      get: {
        tags: ['Sonstiges'],
        summary: 'Alle Tags mit Anzahl Rezepte',
        responses: {
          200: {
            description: 'Tags',
            ...json({ type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'integer' } } } }),
          },
        },
      },
    },
    '/api/health': {
      get: { tags: ['Sonstiges'], summary: 'Health-Check', responses: { 200: { description: 'OK' } } },
    },
    '/uploads/{filename}': {
      get: {
        tags: ['Bilder'],
        summary: 'Bilddatei (die `url` eines Bildes)',
        parameters: [{ name: 'filename', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Bild', content: { 'image/*': {} } }, 404: error('Nicht gefunden') },
      },
    },
  },
  components: {
    schemas: {
      Ingredient: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 200, examples: ['Mehl'] },
          amount: { type: ['number', 'null'], minimum: 0, examples: [500] },
          unit: { ...nullableString, maxLength: 50, examples: ['g'] },
          note: { ...nullableString, maxLength: 500, examples: ['Type 550'] },
        },
      },
      StepInput: {
        type: 'object',
        required: ['text'],
        properties: {
          title: { ...nullableString, maxLength: 200, examples: ['Teig kneten'] },
          text: { type: 'string', maxLength: 10000 },
        },
      },
      Step: {
        allOf: [ref('StepInput'), { type: 'object', properties: { number: { type: 'integer', description: 'Laufende Nummer ab 1' } } }],
      },
      RecipeInput: {
        type: 'object',
        required: ['title'],
        additionalProperties: false,
        properties: {
          title: { type: 'string', maxLength: 200, examples: ['Pizzateig'] },
          subtitle: { ...nullableString, maxLength: 300 },
          description: { ...nullableString, maxLength: 20000 },
          servings: { ...nullableInt, minimum: 1 },
          prepMinutes: { ...nullableInt, minimum: 0, description: 'Arbeitszeit' },
          waitMinutes: { ...nullableInt, minimum: 0, description: 'Ruhe-/Back-/Wartezeit' },
          tags: { type: 'array', maxItems: 30, items: { type: 'string', maxLength: 50 } },
          ingredients: {
            type: 'array', maxItems: 200,
            description: 'Kurzform als String erlaubt: "Salz" ≙ { "name": "Salz" }',
            items: { oneOf: [ref('Ingredient'), { type: 'string' }] },
          },
          steps: {
            type: 'array', maxItems: 200,
            description: 'Kurzform als String erlaubt: "Rühren" ≙ { "text": "Rühren" }',
            items: { oneOf: [ref('StepInput'), { type: 'string' }] },
          },
          coverImageId: { ...nullableInt, description: 'ID eines Bildes dieses Rezepts als Titelbild (sonst das erste Bild)' },
        },
      },
      ImageRef: {
        type: ['object', 'null'],
        properties: { id: { type: 'integer' }, url: { type: 'string' }, caption: nullableString },
      },
      Image: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          url: { type: 'string', examples: ['/uploads/3f1c….jpg'] },
          caption: nullableString,
          position: { type: 'integer' },
          mimeType: { type: 'string' },
          size: { type: 'integer', description: 'Bytes' },
          originalName: nullableString,
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      RecipeSummary: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          subtitle: nullableString,
          description: nullableString,
          servings: nullableInt,
          prepMinutes: nullableInt,
          waitMinutes: nullableInt,
          totalMinutes: nullableInt,
          tags: { type: 'array', items: { type: 'string' } },
          coverImage: ref('ImageRef'),
          imageCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Recipe: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          subtitle: nullableString,
          description: nullableString,
          servings: nullableInt,
          prepMinutes: nullableInt,
          waitMinutes: nullableInt,
          totalMinutes: nullableInt,
          tags: { type: 'array', items: { type: 'string' } },
          ingredients: { type: 'array', items: ref('Ingredient') },
          steps: { type: 'array', items: ref('Step') },
          images: { type: 'array', items: ref('Image') },
          coverImageId: nullableInt,
          coverImage: ref('ImageRef'),
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RecipeList: {
        type: 'object',
        properties: {
          items: { type: 'array', items: ref('RecipeSummary') },
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', examples: ['validation_error'] },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
              },
            },
          },
        },
      },
    },
  },
};
