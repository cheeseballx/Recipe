import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

export const config = {
  port: Number(process.env.PORT ?? 3002),
  host: process.env.HOST ?? '0.0.0.0',
  dbFile: process.env.DB_FILE ?? path.join(root, 'data', 'recipes.db'),
  uploadDir: process.env.UPLOAD_DIR ?? path.join(root, 'data', 'uploads'),
  maxImageBytes: Number(process.env.MAX_IMAGE_MB ?? 10) * 1024 * 1024,
  // Komma-getrennte Liste erlaubter Origins für CORS, "*" für alle, leer = aus
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
    .split(',').map((s) => s.trim()).filter(Boolean),
};
