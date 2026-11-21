import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ApiError } from './errors.js';

/** Erkennt das Bildformat anhand der ersten Bytes (Magic Numbers) – dem Client-Mimetype wird nicht vertraut. */
export function detectImageType(buf) {
  const hex = (start, end) => buf.subarray(start, end).toString('hex');
  const ascii = (start, end) => buf.subarray(start, end).toString('latin1');
  if (buf.length < 12) return null;
  if (hex(0, 3) === 'ffd8ff') return { mime: 'image/jpeg', ext: 'jpg' };
  if (hex(0, 8) === '89504e470d0a1a0a') return { mime: 'image/png', ext: 'png' };
  if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return { mime: 'image/gif', ext: 'gif' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return { mime: 'image/avif', ext: 'avif' };
  return null;
}

export class ImageStore {
  constructor(dir) {
    this.dir = dir;
  }

  async init() {
    await fs.mkdir(this.dir, { recursive: true });
  }

  /** Speichert den Buffer und gibt { filename, mime } zurück. */
  async save(buffer) {
    const type = detectImageType(buffer);
    if (!type) {
      throw new ApiError(415, 'unsupported_media_type', 'Nur JPEG, PNG, WebP, GIF oder AVIF werden unterstützt');
    }
    const filename = `${crypto.randomUUID()}.${type.ext}`;
    await fs.writeFile(path.join(this.dir, filename), buffer, { flag: 'wx' });
    return { filename, mime: type.mime };
  }

  async remove(filename) {
    await fs.rm(path.join(this.dir, path.basename(filename)), { force: true });
  }
}
