import { Router } from 'express';
import multer from 'multer';
import { ApiError, notFound, badRequest } from '../errors.js';
import { parseId, parseImageInput } from '../validation.js';

/**
 * Bilder eines Rezepts: /api/recipes/:id/images
 * @param {{ repo: import('../repository.js').RecipeRepository, images: import('../images.js').ImageStore, maxImageBytes: number }} deps
 */
export function imagesRouter({ repo, images, maxImageBytes }) {
  const router = Router({ mergeParams: true });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxImageBytes, files: 10, fields: 10 },
  });

  const recipeId = (req) => {
    const id = parseId(req.params.id);
    if (!repo.exists(id)) throw notFound('Rezept');
    return id;
  };
  const loadImage = (rid, req) => {
    const image = repo.getImage(rid, parseId(req.params.imageId, 'Bild-ID'));
    if (!image) throw notFound('Bild');
    return image;
  };

  router.get('/', (req, res) => {
    res.json(repo.listImages(recipeId(req)));
  });

  /**
   * Upload als multipart/form-data.
   * Feld "image" (ein oder mehrere Dateien), optional "caption".
   */
  router.post('/', upload.array('image', 10), async (req, res) => {
    const rid = recipeId(req);
    const files = req.files ?? [];
    if (!files.length) throw badRequest('Keine Datei im Feld "image" gefunden');
    const { caption } = parseImageInput({ caption: req.body?.caption });

    const savedFiles = [];
    const ids = [];
    try {
      for (const file of files) {
        const { filename, mime } = await images.save(file.buffer);
        savedFiles.push(filename);
        ids.push(repo.addImage(rid, {
          filename,
          originalName: file.originalname,
          mimeType: mime,
          size: file.size,
          caption,
        }));
      }
    } catch (err) {
      // Alles, was dieser Request schon angelegt hat, wieder entfernen
      for (const id of ids) repo.deleteImage(rid, id);
      await Promise.all(savedFiles.map((f) => images.remove(f)));
      throw err;
    }

    const result = ids.map((id) => repo.getImage(rid, id));
    const first = result[0];
    res.status(201).location(`${req.baseUrl}/${first.id}`).json(result.length === 1 ? first : result);
  });

  router.get('/:imageId', (req, res) => {
    res.json(loadImage(recipeId(req), req));
  });

  router.patch('/:imageId', (req, res) => {
    const rid = recipeId(req);
    const image = loadImage(rid, req);
    repo.updateImage(rid, image.id, parseImageInput(req.body));
    res.json(repo.getImage(rid, image.id));
  });

  router.delete('/:imageId', async (req, res) => {
    const rid = recipeId(req);
    const filename = repo.deleteImage(rid, parseId(req.params.imageId, 'Bild-ID'));
    if (!filename) throw notFound('Bild');
    await images.remove(filename);
    res.status(204).end();
  });

  // Multer-Fehler in saubere API-Fehler übersetzen
  router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(413, 'payload_too_large', `Bild ist zu groß (max. ${Math.round(maxImageBytes / 1024 / 1024)} MB)`));
      }
      return next(badRequest(`Upload-Fehler: ${err.message}`));
    }
    next(err);
  });

  return router;
}
