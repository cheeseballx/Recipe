import { config } from './config.js';
import { openDatabase } from './db.js';
import { ImageStore } from './images.js';
import { createApp } from './app.js';

const db = openDatabase(config.dbFile);
const images = new ImageStore(config.uploadDir);
await images.init();

const app = createApp({ db, images, maxImageBytes: config.maxImageBytes, corsOrigins: config.corsOrigins });

const server = app.listen(config.port, config.host, () => {
  console.log(`Rezepte-API läuft auf http://localhost:${config.port}/api`);
  console.log(`Datenbank: ${config.dbFile}`);
});

const shutdown = () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
